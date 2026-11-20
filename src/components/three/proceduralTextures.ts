import * as THREE from 'three';
import { sampleRouteCenterX } from './routeMath';

export function hashSeed(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function hash2d(ix: number, iy: number, seed: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

export function noise2d(x: number, y: number, seed = 0): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2d(ix, iy, seed);
  const b = hash2d(ix + 1, iy, seed);
  const c = hash2d(ix, iy + 1, seed);
  const d = hash2d(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

export function fbm2d(x: number, y: number, octaves = 4, seed = 0): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise2d(x * freq, y * freq, seed + i * 19.3);
    norm += amp;
    amp *= 0.5;
    freq *= 2.04;
  }
  return value / norm;
}

export function ridgedNoise2d(x: number, y: number, octaves = 4, seed = 13): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = noise2d(x * freq, y * freq, seed + i * 29.1);
    const ridge = 1.0 - Math.abs(n * 2.0 - 1.0);
    value += amp * ridge * ridge;
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return value / norm;
}

function worleyBillow2d(x: number, y: number, seed = 7): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let minD2 = 4.0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const cx = ix + ox;
      const cy = iy + oy;
      const jx = cx + hash2d(cx, cy, seed);
      const jy = cy + hash2d(cx, cy, seed + 41.7);
      const dx = jx - x;
      const dy = jy - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < minD2) minD2 = d2;
    }
  }
  return Math.max(0, 1.0 - Math.sqrt(minD2) * 1.15);
}

export function sampleMountainElevation(x: number, z: number): number {
  const cx = sampleRouteCenterX(z);
  const dx = Math.abs(x - cx);

  const stationMask =
    THREE.MathUtils.smoothstep(-z, 43, 47) * (1 - THREE.MathUtils.smoothstep(-z, 59, 64));
  const airportMask =
    THREE.MathUtils.smoothstep(-z, 118, 124) * (1 - THREE.MathUtils.smoothstep(-z, 166, 173));
  const canyonMask =
    THREE.MathUtils.smoothstep(-z, 62, 69) * (1 - THREE.MathUtils.smoothstep(-z, 116, 123));

  const flatHalfW = Math.max(2.35, stationMask * 8.4, airportMask * 15.2);
  const absRel = airportMask > 0.1 ? Math.abs(x) : stationMask > 0.1 ? Math.abs(x - 0.3) : dx;

  const corridorCarve = THREE.MathUtils.smoothstep(absRel, flatHalfW, flatHalfW + 6.2);
  const slopeRamp = THREE.MathUtils.smoothstep(absRel, flatHalfW + 1.4, flatHalfW + 22.0);

  const ridge = ridgedNoise2d(x * 0.048, z * 0.036, 5, 17);
  const detail = fbm2d(x * 0.14, z * 0.14, 3, 59);
  const mountainPeak = (ridge * 16.2 + detail * 4.0) * slopeRamp;
  const foothills = fbm2d(x * 0.085, z * 0.085, 3, 31) * 2.4 * corridorCarve;

  const canyonDrop = canyonMask * -2.35 * (1 - corridorCarve * 0.72);
  const riverCenterX = Math.sin(z * 0.065) * 3.8;
  const valleyRiverCut =
    canyonMask * Math.exp(-Math.pow((x - riverCenterX) * 0.38, 2)) * -1.35;

  const baseTargetY = THREE.MathUtils.lerp(-0.07, 0.15, airportMask);
  const terrainHeight =
    absRel <= flatHalfW
      ? baseTargetY + canyonDrop + valleyRiverCut
      : baseTargetY + foothills + mountainPeak + canyonDrop + valleyRiverCut;

  const fadeOutEdge = z < -166 ? THREE.MathUtils.smoothstep(-z, 166, 178) : 0;
  return THREE.MathUtils.lerp(terrainHeight, -5.2, fadeOutEdge);
}

function configureTexture(
  tex: THREE.Texture,
  renderer: THREE.WebGLRenderer,
  isColor: boolean,
  repeatX = 1,
  repeatY = 1
): void {
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = repeatX > 1 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.wrapT = repeatY > 1 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  if (repeatX > 1 || repeatY > 1) {
    tex.repeat.set(repeatX, repeatY);
  }
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate = true;
}

export function createBrushedMetalNormalMap(renderer: THREE.WebGLRenderer, size = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const streak = Math.sin((x / size) * Math.PI * 26 + hashSeed(y * 13.7) * 1.4) * 7;
      const micro = (hashSeed(x * 73.1 + y * 19.3) - 0.5) * 8;
      const seamX = x % 64 === 0 ? 22 : x % 64 === 1 ? -16 : 0;
      const seamY = y % 64 === 0 ? 22 : y % 64 === 1 ? -16 : 0;
      data[idx] = Math.min(255, Math.max(0, Math.round(128 + streak + seamX)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(128 + micro + seamY)));
      data[idx + 2] = 248;
      data[idx + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  configureTexture(texture, renderer, false, 6, 6);
  return texture;
}

export function createRoadHighwayTexture(renderer: THREE.WebGLRenderer): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const w = 512;
  const h = 512;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = w;
  mapCanvas.height = h;
  const mCtx = mapCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');

  if (mCtx && bCtx) {
    const mImg = mCtx.createImageData(w, h);
    const bImg = bCtx.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const u = x / w;
        const grain = hash2d(x, y, 5) * 14 + fbm2d(u * 18, (y / h) * 18, 3, 21) * 12;
        const leftTrack = Math.exp(-Math.pow((u - 0.34) * 14, 2)) * 10;
        const rightTrack = Math.exp(-Math.pow((u - 0.66) * 14, 2)) * 10;
        const wear = leftTrack + rightTrack;
        const base = Math.max(18, Math.min(64, Math.round(30 + grain - wear * 0.6)));

        mImg.data[idx] = base;
        mImg.data[idx + 1] = base + 2;
        mImg.data[idx + 2] = base + 5;
        mImg.data[idx + 3] = 255;

        const bVal = Math.round(110 + grain * 4.5);
        bImg.data[idx] = bVal;
        bImg.data[idx + 1] = bVal;
        bImg.data[idx + 2] = bVal;
        bImg.data[idx + 3] = 255;
      }
    }
    mCtx.putImageData(mImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);

    mCtx.fillStyle = 'rgb(202, 148, 28)';
    mCtx.fillRect(26, 0, 8, h);
    mCtx.fillRect(w - 34, 0, 8, h);

    mCtx.fillStyle = 'rgb(206, 212, 220)';
    for (let y = 16; y < h; y += 72) {
      mCtx.fillRect(w / 2 - 4, y, 8, 36);
    }

    mCtx.fillStyle = 'rgba(20, 24, 30, 0.45)';
    mCtx.fillRect(0, 0, 18, h);
    mCtx.fillRect(w - 18, 0, 18, h);
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(map, renderer, true, 1, 16);
  configureTexture(bumpMap, renderer, false, 1, 16);
  return { map, bumpMap };
}

export function createRailwayTrackTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const gravel = 44 + Math.floor(hash2d(x, y, 71) * 32);
        img.data[idx] = gravel;
        img.data[idx + 1] = gravel - 2;
        img.data[idx + 2] = gravel - 4;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    for (let y = 0; y < h; y += 24) {
      ctx.fillStyle = 'rgb(62, 56, 50)';
      ctx.fillRect(24, y + 4, w - 48, 10);
      ctx.fillStyle = 'rgb(44, 40, 36)';
      ctx.fillRect(24, y + 14, w - 48, 3);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  configureTexture(tex, renderer, true, 1, 32);
  return tex;
}

export function createMountainDetailTexture(renderer: THREE.WebGLRenderer): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = size;
  mapCanvas.height = size;
  const mCtx = mapCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (mCtx && bCtx) {
    const mImg = mCtx.createImageData(size, size);
    const bImg = bCtx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        const idx = (y * size + x) * 4;
        const macro = fbm2d(u * 12, v * 12, 4, 15);
        const micro = hash2d(x, y, 42) * 0.14;
        const strata = Math.sin((u * 8 + v * 14 + macro * 2) * Math.PI) * 0.08;
        const shade = Math.max(0.55, Math.min(1.0, 0.72 + macro * 0.24 + micro + strata));

        const byte = Math.round(shade * 224);
        mImg.data[idx] = byte;
        mImg.data[idx + 1] = byte;
        mImg.data[idx + 2] = byte;
        mImg.data[idx + 3] = 255;

        const bByte = Math.round((macro * 0.75 + micro * 1.5) * 240);
        bImg.data[idx] = bByte;
        bImg.data[idx + 1] = bByte;
        bImg.data[idx + 2] = bByte;
        bImg.data[idx + 3] = 255;
      }
    }
    mCtx.putImageData(mImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(map, renderer, true, 16, 24);
  configureTexture(bumpMap, renderer, false, 16, 24);
  return { map, bumpMap };
}

export function createAerospaceHullTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
    baseGrad.addColorStop(0, 'rgb(196, 202, 210)');
    baseGrad.addColorStop(0.55, 'rgb(182, 190, 200)');
    baseGrad.addColorStop(0.56, 'rgb(154, 162, 174)');
    baseGrad.addColorStop(0.88, 'rgb(168, 176, 188)');
    baseGrad.addColorStop(0.89, 'rgb(30, 36, 46)');
    baseGrad.addColorStop(1, 'rgb(22, 27, 36)');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgb(184, 58, 22)';
    ctx.fillRect(0, Math.floor(h * 0.24), w, Math.floor(h * 0.028));
    ctx.fillStyle = 'rgb(24, 34, 48)';
    ctx.fillRect(0, Math.floor(h * 0.278), w, Math.floor(h * 0.014));

    ctx.strokeStyle = 'rgba(28, 36, 52, 0.34)';
    ctx.lineWidth = 1.5;
    for (let y = 32; y < h; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  configureTexture(tex, renderer, true, 1, 1);
  return tex;
}

export function createCeramicHeatShieldTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgb(14, 18, 24)';
    ctx.fillRect(0, 0, size, size);
    const tileW = 32;
    const tileH = 16;
    for (let row = 0; row < size / tileH; row++) {
      const offset = (row % 2) * (tileW / 2);
      for (let col = -1; col <= size / tileW; col++) {
        const shade = 18 + Math.floor(hash2d(col, row, 9) * 14);
        ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 5})`;
        ctx.fillRect(col * tileW + offset + 1, row * tileH + 1, tileW - 2, tileH - 2);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  configureTexture(tex, renderer, true, 4, 4);
  return tex;
}

export function createGoldKaptonFoilTexture(renderer: THREE.WebGLRenderer): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    const cImg = cCtx.createImageData(size, size);
    const bImg = bCtx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const crinkle =
          fbm2d(x * 0.09, y * 0.09, 4, 31) * 0.65 +
          Math.abs(Math.sin((x + y) * 0.19) * Math.cos((x - y) * 0.19)) * 0.35;
        const quilt = (x + y) % 32 === 0 || Math.abs((x - y) % 32) === 0 ? 0.72 : 1.0;
        const v = crinkle * quilt;
        cImg.data[idx] = Math.min(220, Math.round(145 + v * 52));
        cImg.data[idx + 1] = Math.min(200, Math.round(96 + v * 50));
        cImg.data[idx + 2] = Math.min(120, Math.round(16 + v * 26));
        cImg.data[idx + 3] = 255;

        const bVal = Math.min(255, Math.round(v * 255));
        bImg.data[idx] = bVal;
        bImg.data[idx + 1] = bVal;
        bImg.data[idx + 2] = bVal;
        bImg.data[idx + 3] = 255;
      }
    }
    cCtx.putImageData(cImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);
  }
  const map = new THREE.CanvasTexture(colorCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(map, renderer, true, 3, 3);
  configureTexture(bumpMap, renderer, false, 3, 3);
  return { map, bumpMap };
}

export function createSolarArrayTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgb(10, 22, 46)';
    ctx.fillRect(0, 0, size, size);

    const cellW = 32;
    const cellH = 64;
    for (let y = 0; y < size; y += cellH) {
      for (let x = 0; x < size; x += cellW) {
        const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
        grad.addColorStop(0, 'rgb(14, 34, 72)');
        grad.addColorStop(0.5, 'rgb(18, 46, 94)');
        grad.addColorStop(1, 'rgb(12, 26, 58)');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

        ctx.fillStyle = 'rgba(150, 185, 220, 0.24)';
        ctx.fillRect(x + cellW / 2 - 0.5, y + 2, 1, cellH - 4);
      }
    }

    ctx.strokeStyle = 'rgb(162, 126, 58)';
    ctx.lineWidth = 2;
    for (let y = 0; y <= size; y += cellH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  configureTexture(tex, renderer, true, 3, 2);
  return tex;
}

export function createEarthPlanetTextures(renderer: THREE.WebGLRenderer): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  cloudsMap: THREE.CanvasTexture;
} {
  const w = 512;
  const h = 256;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = w;
  mapCanvas.height = h;
  const mCtx = mapCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = w;
  roughCanvas.height = h;
  const rCtx = roughCanvas.getContext('2d');

  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = w;
  cloudCanvas.height = h;
  const cCtx = cloudCanvas.getContext('2d');

  if (mCtx && bCtx && rCtx && cCtx) {
    const mImg = mCtx.createImageData(w, h);
    const bImg = bCtx.createImageData(w, h);
    const rImg = rCtx.createImageData(w, h);
    const cImg = cCtx.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = Math.abs(v - 0.5) * 2;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const idx = (y * w + x) * 4;

        const warpX = fbm2d(u * 4.5, v * 4.5, 3, 11) * 0.45;
        const warpY = fbm2d(u * 4.5 + 5.2, v * 4.5 + 1.3, 3, 23) * 0.45;
        const continent = fbm2d(u * 3.8 + warpX, v * 3.8 + warpY, 5, 7);
        const detail = fbm2d(u * 16, v * 16, 3, 41);
        const polarIce = lat > 0.84 + (detail - 0.5) * 0.08;

        let r = 10;
        let g = 38;
        let b = 82;
        let bump = 10;
        let rough = 52;

        if (polarIce) {
          r = 196;
          g = 206;
          b = 216;
          bump = 165;
          rough = 185;
        } else if (continent > 0.51) {
          const elev = Math.min(1, (continent - 0.51) / 0.35);
          const arid = fbm2d(u * 6.5, v * 6.5, 3, 83) + (1 - lat) * 0.25;
          if (elev > 0.68) {
            r = Math.round(98 + elev * 72);
            g = Math.round(92 + elev * 68);
            b = Math.round(88 + elev * 66);
            bump = Math.round(180 + elev * 75);
            rough = 225;
          } else if (arid > 0.68 && lat < 0.52) {
            r = Math.round(154 + detail * 30);
            g = Math.round(124 + detail * 24);
            b = Math.round(82 + detail * 18);
            bump = Math.round(95 + elev * 85);
            rough = 210;
          } else {
            r = Math.round(26 + detail * 28 + elev * 20);
            g = Math.round(72 + detail * 34 + elev * 18);
            b = Math.round(36 + detail * 18);
            bump = Math.round(85 + elev * 95);
            rough = 195;
          }
        } else {
          const shelf = Math.max(0, (continent - 0.44) / 0.07);
          r = Math.round(8 + shelf * 18);
          g = Math.round(32 + shelf * 52);
          b = Math.round(72 + shelf * 44);
          bump = 12;
          rough = 48;
        }

        mImg.data[idx] = r;
        mImg.data[idx + 1] = g;
        mImg.data[idx + 2] = b;
        mImg.data[idx + 3] = 255;

        bImg.data[idx] = bump;
        bImg.data[idx + 1] = bump;
        bImg.data[idx + 2] = bump;
        bImg.data[idx + 3] = 255;

        rImg.data[idx] = rough;
        rImg.data[idx + 1] = rough;
        rImg.data[idx + 2] = rough;
        rImg.data[idx + 3] = 255;

        const swirl = fbm2d(u * 7.5 + warpX * 1.3, v * 7.5 - warpY * 1.1, 4, 109);
        const cloudAlpha = Math.max(0, Math.min(200, Math.round((swirl - 0.5) * 440)));
        cImg.data[idx] = 212;
        cImg.data[idx + 1] = 218;
        cImg.data[idx + 2] = 226;
        cImg.data[idx + 3] = cloudAlpha;
      }
    }

    mCtx.putImageData(mImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);
    rCtx.putImageData(rImg, 0, 0);
    cCtx.putImageData(cImg, 0, 0);
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  const cloudsMap = new THREE.CanvasTexture(cloudCanvas);
  configureTexture(map, renderer, true);
  configureTexture(bumpMap, renderer, false);
  configureTexture(roughnessMap, renderer, false);
  configureTexture(cloudsMap, renderer, true);
  return { map, bumpMap, roughnessMap, cloudsMap };
}

export function createMoonRegolithTextures(renderer: THREE.WebGLRenderer): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const w = 512;
  const h = 256;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = w;
  mapCanvas.height = h;
  const mCtx = mapCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');

  const craters: { cx: number; cy: number; rad: number; depth: number }[] = [];
  for (let i = 0; i < 65; i++) {
    craters.push({
      cx: hashSeed(i * 3.7 + 1),
      cy: 0.12 + hashSeed(i * 5.3 + 2) * 0.76,
      rad: 0.018 + Math.pow(hashSeed(i * 9.1 + 3), 2.2) * 0.095,
      depth: 0.45 + hashSeed(i * 11.3) * 0.55,
    });
  }

  if (mCtx && bCtx) {
    const mImg = mCtx.createImageData(w, h);
    const bImg = bCtx.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const idx = (y * w + x) * 4;

        const maria = fbm2d(u * 4.2, v * 4.2, 4, 53);
        const grain = fbm2d(u * 24, v * 24, 3, 97);
        let heightVal = maria * 0.65 + grain * 0.35;

        for (let c = 0; c < craters.length; c++) {
          const cr = craters[c];
          const dx = Math.min(Math.abs(u - cr.cx), 1 - Math.abs(u - cr.cx));
          const dy = (v - cr.cy) * 0.55;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cr.rad * 1.35) {
            const norm = dist / cr.rad;
            if (norm < 0.82) {
              heightVal -= (1 - norm * norm) * 0.28 * cr.depth;
            } else if (norm < 1.15) {
              const rim = 1 - Math.abs(norm - 0.98) / 0.17;
              heightVal += rim * 0.18 * cr.depth;
            }
          }
        }

        const clamped = Math.max(0.12, Math.min(0.88, heightVal));
        const baseShade = Math.round(58 + clamped * 102);
        mImg.data[idx] = baseShade + 4;
        mImg.data[idx + 1] = baseShade + 2;
        mImg.data[idx + 2] = baseShade - 2;
        mImg.data[idx + 3] = 255;

        const bVal = Math.round(clamped * 255);
        bImg.data[idx] = bVal;
        bImg.data[idx + 1] = bVal;
        bImg.data[idx + 2] = bVal;
        bImg.data[idx + 3] = 255;
      }
    }
    mCtx.putImageData(mImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(map, renderer, true);
  configureTexture(bumpMap, renderer, false);
  return { map, bumpMap };
}

export function createMarsPlanetTextures(renderer: THREE.WebGLRenderer): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const w = 512;
  const h = 256;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = w;
  mapCanvas.height = h;
  const mCtx = mapCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');

  if (mCtx && bCtx) {
    const mImg = mCtx.createImageData(w, h);
    const bImg = bCtx.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = Math.abs(v - 0.5) * 2;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const idx = (y * w + x) * 4;
        const terrain = fbm2d(u * 5.2, v * 5.2, 5, 19);
        const fine = fbm2d(u * 18, v * 18, 3, 61);
        const canyon =
          Math.exp(-Math.pow((v - 0.52) * 18, 2)) *
          Math.exp(-Math.pow((u - 0.48) * 5.5, 2)) *
          0.38;
        const hVal = Math.max(0.05, Math.min(0.92, terrain * 0.75 + fine * 0.25 - canyon));

        if (lat > 0.89 + (fine - 0.5) * 0.06) {
          mImg.data[idx] = 200;
          mImg.data[idx + 1] = 194;
          mImg.data[idx + 2] = 188;
        } else {
          mImg.data[idx] = Math.min(220, Math.round(76 + hVal * 108));
          mImg.data[idx + 1] = Math.min(180, Math.round(34 + hVal * 62));
          mImg.data[idx + 2] = Math.min(140, Math.round(22 + hVal * 34));
        }
        mImg.data[idx + 3] = 255;

        const bVal = Math.round(hVal * 255);
        bImg.data[idx] = bVal;
        bImg.data[idx + 1] = bVal;
        bImg.data[idx + 2] = bVal;
        bImg.data[idx + 3] = 255;
      }
    }
    mCtx.putImageData(mImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(map, renderer, true);
  configureTexture(bumpMap, renderer, false);
  return { map, bumpMap };
}

export function createGasGiantTextures(renderer: THREE.WebGLRenderer): {
  map: THREE.CanvasTexture;
  ringMap: THREE.CanvasTexture;
} {
  const w = 512;
  const h = 256;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = w;
  mapCanvas.height = h;
  const mCtx = mapCanvas.getContext('2d');

  if (mCtx) {
    const mImg = mCtx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const idx = (y * w + x) * 4;
        const eddy = (fbm2d(u * 10, v * 16, 4, 71) - 0.5) * 0.045;
        const bandCoord = (v + eddy) * Math.PI * 11;
        const band = 0.5 + 0.5 * Math.sin(bandCoord);
        const subBand = 0.5 + 0.5 * Math.cos(bandCoord * 2.3 + fbm2d(u * 6, v * 6, 3, 14) * 2.5);

        const stormDx = (u - 0.62) * 3.2;
        const stormDy = (v - 0.64) * 7.5;
        const storm = Math.exp(-(stormDx * stormDx + stormDy * stormDy) * 4.5);

        const r = Math.min(210, Math.round(136 + band * 48 + subBand * 14 + storm * 24));
        const g = Math.min(185, Math.round(104 + band * 46 + subBand * 12 - storm * 10));
        const b = Math.min(150, Math.round(72 + band * 40 + subBand * 10 - storm * 18));

        mImg.data[idx] = r;
        mImg.data[idx + 1] = g;
        mImg.data[idx + 2] = b;
        mImg.data[idx + 3] = 255;
      }
    }
    mCtx.putImageData(mImg, 0, 0);
  }

  const rw = 256;
  const rh = 64;
  const ringCanvas = document.createElement('canvas');
  ringCanvas.width = rw;
  ringCanvas.height = rh;
  const rCtx = ringCanvas.getContext('2d');
  if (rCtx) {
    const rImg = rCtx.createImageData(rw, rh);
    for (let x = 0; x < rw; x++) {
      const t = x / rw;
      const fine = 0.5 + 0.5 * Math.sin(t * 140) * Math.cos(t * 43);
      const cassiniGap = t > 0.58 && t < 0.65 ? 0.08 : 1.0;
      const enckeGap = t > 0.84 && t < 0.865 ? 0.15 : 1.0;
      const edgeFade = Math.sin(Math.min(1, t / 0.12) * Math.PI * 0.5) * Math.sin(Math.min(1, (1 - t) / 0.08) * Math.PI * 0.5);
      const density = (0.35 + 0.65 * fine) * cassiniGap * enckeGap * edgeFade;

      const r = Math.round(164 + fine * 32);
      const g = Math.round(146 + fine * 28);
      const b = Math.round(114 + fine * 24);
      const a = Math.round(Math.max(0, Math.min(205, density * 195)));

      for (let y = 0; y < rh; y++) {
        const idx = (y * rw + x) * 4;
        rImg.data[idx] = r;
        rImg.data[idx + 1] = g;
        rImg.data[idx + 2] = b;
        rImg.data[idx + 3] = a;
      }
    }
    rCtx.putImageData(rImg, 0, 0);
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  const ringMap = new THREE.CanvasTexture(ringCanvas);
  configureTexture(map, renderer, true);
  configureTexture(ringMap, renderer, true);
  return { map, ringMap };
}

export function createExoplanetTextures(renderer: THREE.WebGLRenderer): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const w = 512;
  const h = 256;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = w;
  mapCanvas.height = h;
  const mCtx = mapCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');

  if (mCtx && bCtx) {
    const mImg = mCtx.createImageData(w, h);
    const bImg = bCtx.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const idx = (y * w + x) * 4;
        const ice = fbm2d(u * 5.5, v * 5.5, 4, 37);
        const ridge = Math.abs(fbm2d(u * 12, v * 12, 3, 89) - 0.5);
        const crack = ridge < 0.032 ? 1 - ridge / 0.032 : 0;

        const r = Math.min(210, Math.round(32 + ice * 134 + crack * 110));
        const g = Math.min(215, Math.round(84 + ice * 108 - crack * 20));
        const b = Math.min(220, Math.round(122 + ice * 80 - crack * 44));

        mImg.data[idx] = r;
        mImg.data[idx + 1] = g;
        mImg.data[idx + 2] = b;
        mImg.data[idx + 3] = 255;

        const bVal = Math.max(0, Math.min(255, Math.round((ice * 0.8 + (1 - crack) * 0.2) * 255)));
        bImg.data[idx] = bVal;
        bImg.data[idx + 1] = bVal;
        bImg.data[idx + 2] = bVal;
        bImg.data[idx + 3] = 255;
      }
    }
    mCtx.putImageData(mImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(map, renderer, true);
  configureTexture(bumpMap, renderer, false);
  return { map, bumpMap };
}

export function createCloudAtlasTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 512;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const img = ctx.createImageData(size, size);
    const densGrid = new Float32Array(half * half);

    for (let cell = 0; cell < 4; cell++) {
      const cxIdx = cell % 2;
      const cyIdx = Math.floor(cell / 2);
      const seed = 17 + cell * 43;
      const isWisp = cell >= 2;

      for (let py = 0; py < half; py++) {
        const v = (py / half) * 2 - 1;
        for (let px = 0; px < half; px++) {
          const u = (px / half) * 2 - 1;
          const flatY = !isWisp && v > 0.12 ? v * 1.45 : v;
          const aspectU = isWisp ? u * 0.88 : u;
          const dist = Math.sqrt(aspectU * aspectU + flatY * flatY);

          const warp = fbm2d((u + 1) * 2.6, (v + 1) * 2.6, 3, seed + 5) * 0.34;
          const macroBillow =
            worleyBillow2d((u + 2) * 2.1 + warp, (v + 2) * 2.1 - warp, seed) * 0.52 +
            worleyBillow2d((u + 2) * 4.4 - warp, (v + 2) * 4.4 + warp, seed + 13) * 0.28 +
            fbm2d((u + 3) * 5.2, (v + 3) * 5.2, 4, seed + 29) * 0.46;

          const falloff = Math.max(0, 1 - THREE.MathUtils.smoothstep(dist, 0.22, 0.94));
          const raw = (macroBillow - (isWisp ? 0.34 : 0.26)) * falloff * (isWisp ? 1.55 : 1.85);
          densGrid[py * half + px] = Math.max(0, Math.min(1, raw));
        }
      }

      for (let py = 0; py < half; py++) {
        for (let px = 0; px < half; px++) {
          const x = cxIdx * half + px;
          const y = cyIdx * half + py;
          const idx = (y * size + x) * 4;

          const dC = densGrid[py * half + px];
          const dL = densGrid[py * half + Math.max(0, px - 2)];
          const dR = densGrid[py * half + Math.min(half - 1, px + 2)];
          const dU = densGrid[Math.max(0, py - 2) * half + px];
          const dD = densGrid[Math.min(half - 1, py + 2) * half + px];

          const nx = THREE.MathUtils.clamp(0.5 + (dL - dR) * 1.8, 0, 1);
          const vPosBias = 1.0 - py / half;
          const ny = THREE.MathUtils.clamp(0.32 + vPosBias * 0.44 + (dD - dU) * 1.8, 0, 1);
          const ao = THREE.MathUtils.clamp(0.38 + dC * 0.42 + vPosBias * 0.2, 0, 1);

          img.data[idx] = Math.round(nx * 255);
          img.data[idx + 1] = Math.round(ny * 255);
          img.data[idx + 2] = Math.round(ao * 255);
          img.data[idx + 3] = Math.round(Math.pow(dC, 0.92) * 255);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate = true;
  return tex;
}

export function createRadialGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 200, 145, 0.72)');
    grad.addColorStop(0.35, 'rgba(234, 88, 12, 0.35)');
    grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.1)');
    grad.addColorStop(1, 'rgba(6, 8, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function disposeObjectSubtree(root: THREE.Object3D): void {
  root.traverse((child) => {
    child.dispose();
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of materials) {
        const record = mat as unknown as Record<string, unknown>;
        for (const value of Object.values(record)) {
          if (value && typeof value === 'object' && 'isTexture' in value && (value as THREE.Texture).isTexture) {
            (value as THREE.Texture).dispose();
          }
        }
        mat.dispose();
      }
    }
  });
}
