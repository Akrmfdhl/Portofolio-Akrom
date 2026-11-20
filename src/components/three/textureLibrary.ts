import * as THREE from 'three';
import { hashSeed } from './proceduralTextures';

export interface PbrTextureSet {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

export interface CityTexturePair {
  map: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
}

export interface TextureBundle {
  earthDay: THREE.Texture;
  earthNight: THREE.Texture;
  earthNormal: THREE.Texture;
  earthSpecular: THREE.Texture;
  earthClouds: THREE.Texture;
  mars: THREE.Texture;
  jupiter: THREE.Texture;
  saturn: THREE.Texture;
  saturnRingAlpha: THREE.Texture;
  moon: THREE.Texture;
  venus: THREE.Texture;
  mercury: THREE.Texture;
  neptune: THREE.Texture;
  milkyWay: THREE.Texture;
  asphalt: PbrTextureSet;
  ballast: PbrTextureSet;
  concrete: PbrTextureSet;
  terrain: PbrTextureSet;
  wood: PbrTextureSet;
  metal: PbrTextureSet;
  fabricNormal: THREE.Texture;
  fabricRoughness: THREE.Texture;
  leather: PbrTextureSet;
  balloonCanopy: THREE.CanvasTexture;
  wickerWeave: THREE.CanvasTexture;
  cityAerial: CityTexturePair;
  trainLivery: THREE.CanvasTexture;
  runwayMap: THREE.CanvasTexture;
  criticalReady: Promise<void>;
  startDeferredLoads: () => void;
  createStationSign: (code: string, title: string, numberLabel: string) => THREE.CanvasTexture;
  dispose: () => void;
}

function createCityAerialTextures(renderer: THREE.WebGLRenderer): CityTexturePair {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d')!;

  const emCanvas = document.createElement('canvas');
  emCanvas.width = size;
  emCanvas.height = size;
  const eCtx = emCanvas.getContext('2d')!;

  cCtx.fillStyle = 'rgb(20, 26, 36)';
  cCtx.fillRect(0, 0, size, size);
  eCtx.fillStyle = 'rgb(0, 0, 0)';
  eCtx.fillRect(0, 0, size, size);

  const blockStep = 32;
  for (let gx = 0; gx < size; gx += blockStep) {
    for (let gy = 0; gy < size; gy += blockStep) {
      const seed = hashSeed(gx * 0.26 + gy * 0.58);
      const isPark = seed > 0.86;
      const shade = Math.round(24 + seed * 18);
      cCtx.fillStyle = isPark
        ? `rgb(${18 + Math.round(seed * 12)}, ${34 + Math.round(seed * 14)}, ${26 + Math.round(seed * 8)})`
        : `rgb(${shade}, ${shade + 5}, ${shade + 12})`;
      cCtx.fillRect(gx + 3, gy + 3, blockStep - 6, blockStep - 6);

      if (!isPark) {
        const subCount = 3;
        const pad = 4;
        const innerW = (blockStep - pad * 2) / subCount;
        for (let sx = 0; sx < subCount; sx++) {
          for (let sy = 0; sy < subCount; sy++) {
            const bs = hashSeed(gx * 1.4 + gy * 2.2 + sx * 17 + sy * 31);
            const rx = gx + pad + sx * innerW + 1;
            const ry = gy + pad + sy * innerW + 1;
            const rw = innerW - 2;
            const bTone = Math.round(32 + bs * 24);
            cCtx.fillStyle = `rgb(${bTone}, ${bTone + 6}, ${bTone + 14})`;
            cCtx.fillRect(rx, ry, rw, rw);

            if (bs > 0.34) {
              const warm = bs > 0.56;
              eCtx.fillStyle = warm
                ? `rgba(255, 198, 118, ${(0.28 + bs * 0.45).toFixed(2)})`
                : `rgba(148, 210, 255, ${(0.22 + bs * 0.35).toFixed(2)})`;
              eCtx.fillRect(rx + 1, ry + 1, Math.max(1, rw - 2), Math.max(1, rw - 2));
            }
          }
        }
      }
    }
  }

  for (let gx = 0; gx < size; gx += blockStep) {
    const isArterial = (gx / blockStep) % 4 === 0;
    cCtx.fillStyle = isArterial ? 'rgb(34, 42, 56)' : 'rgb(26, 32, 42)';
    cCtx.fillRect(gx - (isArterial ? 2 : 1), 0, isArterial ? 4 : 2, size);
    cCtx.fillRect(0, gx - (isArterial ? 2 : 1), size, isArterial ? 4 : 2);

    if (isArterial) {
      for (let d = 3; d < size; d += 9) {
        eCtx.fillStyle = 'rgba(251, 191, 36, 0.82)';
        eCtx.fillRect(gx - 1, d, 1, 3);
        eCtx.fillRect(gx + 1, d + 2, 1, 3);
        eCtx.fillRect(d, gx - 1, 3, 1);
        eCtx.fillRect(d + 2, gx + 1, 3, 1);
      }
    } else {
      for (let d = 5; d < size; d += 14) {
        eCtx.fillStyle = 'rgba(226, 174, 108, 0.42)';
        eCtx.fillRect(gx - 1, d, 1, 2);
        eCtx.fillRect(d, gx - 1, 2, 1);
      }
    }
  }

  cCtx.strokeStyle = 'rgb(16, 44, 72)';
  cCtx.lineWidth = 18;
  cCtx.beginPath();
  cCtx.moveTo(0, size * 0.28);
  cCtx.bezierCurveTo(size * 0.32, size * 0.42, size * 0.68, size * 0.16, size, size * 0.34);
  cCtx.stroke();

  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(6, 8);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = aniso;

  const emissiveMap = new THREE.CanvasTexture(emCanvas);
  emissiveMap.wrapS = THREE.RepeatWrapping;
  emissiveMap.wrapT = THREE.RepeatWrapping;
  emissiveMap.repeat.set(6, 8);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.anisotropy = aniso;

  return { map, emissiveMap };
}

function createTrainLiveryTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgb(228, 234, 242)');
  grad.addColorStop(0.68, 'rgb(214, 222, 234)');
  grad.addColorStop(1, 'rgb(174, 184, 198)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgb(26, 78, 178)';
  ctx.fillRect(0, 146, w, 26);

  ctx.fillStyle = 'rgb(206, 46, 36)';
  ctx.fillRect(0, 175, w, 9);

  ctx.fillStyle = 'rgb(40, 48, 60)';
  ctx.fillRect(0, 74, w, 58);

  ctx.fillStyle = 'rgb(18, 28, 44)';
  for (let x = 24; x < w - 32; x += 68) {
    if (x > 340 && x < 410) continue;
    if (x > 740 && x < 810) continue;
    ctx.fillRect(x, 82, 52, 42);
    ctx.fillStyle = 'rgba(130, 188, 240, 0.22)';
    ctx.fillRect(x + 3, 84, 46, 12);
    ctx.fillStyle = 'rgb(18, 28, 44)';
  }

  const drawDoor = (dx: number) => {
    ctx.fillStyle = 'rgb(196, 206, 218)';
    ctx.fillRect(dx, 44, 58, 194);
    ctx.strokeStyle = 'rgb(96, 110, 128)';
    ctx.lineWidth = 3;
    ctx.strokeRect(dx + 1, 45, 56, 192);
    ctx.beginPath();
    ctx.moveTo(dx + 29, 45);
    ctx.lineTo(dx + 29, 237);
    ctx.stroke();
    ctx.fillStyle = 'rgb(20, 32, 48)';
    ctx.fillRect(dx + 8, 72, 16, 52);
    ctx.fillRect(dx + 34, 72, 16, 52);
  };
  drawDoor(346);
  drawDoor(746);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('AKROM EXPRESS · SHINKANSEN 01', 46, 164);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createHotAirBalloonTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const gores = 16;
  const goreW = w / gores;
  const bandColors = [
    'rgb(198, 42, 34)',
    'rgb(238, 232, 220)',
    'rgb(28, 78, 168)',
    'rgb(228, 134, 24)',
  ];

  for (let g = 0; g < gores; g++) {
    const x0 = g * goreW;
    const baseCol = bandColors[g % bandColors.length];
    ctx.fillStyle = baseCol;
    ctx.fillRect(x0, 0, goreW + 1, h);

    ctx.fillStyle = g % 2 === 0 ? 'rgb(240, 234, 222)' : 'rgb(22, 62, 136)';
    ctx.fillRect(x0, h * 0.34, goreW + 1, h * 0.12);

    ctx.fillStyle = g % 2 === 0 ? 'rgb(218, 92, 24)' : 'rgb(238, 232, 220)';
    ctx.fillRect(x0, h * 0.56, goreW + 1, h * 0.08);

    ctx.fillStyle = 'rgb(26, 32, 44)';
    ctx.fillRect(x0, 0, 3, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    for (let ry = 18; ry < h; ry += 36) {
      ctx.fillRect(x0 + 4, ry, goreW - 8, 2);
    }
  }

  ctx.fillStyle = 'rgb(234, 228, 214)';
  ctx.fillRect(0, 0, w, h * 0.09);
  ctx.fillStyle = 'rgb(30, 36, 48)';
  ctx.fillRect(0, h * 0.088, w, 6);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createWickerWeaveTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const s = 512;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(112, 76, 42)';
  ctx.fillRect(0, 0, s, s);

  const cell = 16;
  for (let y = 0; y < s; y += cell) {
    for (let x = 0; x < s; x += cell) {
      const horiz = ((x / cell + y / cell) & 1) === 0;
      const jitter = Math.round((hashSeed(x * 0.31 + y * 0.77) - 0.5) * 18);
      if (horiz) {
        ctx.fillStyle = `rgb(${156 + jitter}, ${110 + jitter}, ${62 + jitter})`;
        ctx.fillRect(x + 1, y + 2, cell - 2, cell - 4);
        ctx.fillStyle = 'rgba(42, 24, 12, 0.35)';
        ctx.fillRect(x, y + cell - 2, cell, 2);
      } else {
        ctx.fillStyle = `rgb(${132 + jitter}, ${90 + jitter}, ${48 + jitter})`;
        ctx.fillRect(x + 2, y + 1, cell - 4, cell - 2);
        ctx.fillStyle = 'rgba(42, 24, 12, 0.35)';
        ctx.fillRect(x + cell - 2, y, 2, cell);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createRunwaySurfaceTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const w = 512;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(34, 39, 47)';
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 1600; i++) {
    const gx = Math.floor(hashSeed(i * 3.17) * w);
    const gy = Math.floor(hashSeed(i * 7.91) * h);
    const v = 26 + Math.floor(hashSeed(i * 11.3) * 24);
    ctx.fillStyle = `rgb(${v}, ${v + 3}, ${v + 7})`;
    ctx.fillRect(gx, gy, 3, 6);
  }

  ctx.fillStyle = 'rgba(18, 20, 24, 0.34)';
  ctx.fillRect(w * 0.42, h * 0.14, w * 0.16, h * 0.72);

  ctx.fillStyle = 'rgb(226, 232, 240)';
  ctx.fillRect(24, 0, 12, h);
  ctx.fillRect(w - 36, 0, 12, h);

  const drawThreshold = (yBase: number) => {
    for (let s = 0; s < 8; s++) {
      const sx = 54 + s * 52;
      if (Math.abs(sx + 16 - w * 0.5) < 24) continue;
      ctx.fillRect(sx, yBase, 26, 76);
    }
  };
  drawThreshold(26);
  drawThreshold(h - 102);

  ctx.fillStyle = 'rgb(236, 242, 248)';
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('09L', w * 0.5, h - 134);

  ctx.save();
  ctx.translate(w * 0.5, 166);
  ctx.rotate(Math.PI);
  ctx.fillText('27R', 0, 0);
  ctx.restore();

  ctx.fillRect(w * 0.25, 224, 34, 92);
  ctx.fillRect(w * 0.75 - 34, 224, 34, 92);
  ctx.fillRect(w * 0.25, h - 316, 34, 92);
  ctx.fillRect(w * 0.75 - 34, h - 316, 34, 92);

  for (let y = 210; y < h - 210; y += 72) {
    ctx.fillRect(w * 0.5 - 6, y, 12, 42);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function makeNeutralCanvas(r: number, g: number, b: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 2;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, 2, 2);
  return c;
}

export function createTextureBundle(renderer: THREE.WebGLRenderer): TextureBundle {
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const tracked: THREE.Texture[] = [];
  const criticalPromises: Promise<void>[] = [];
  const deferredQueue: Array<{ tex: THREE.Texture; url: string }> = [];
  let disposed = false;
  let deferredStarted = false;

  const placeholderColor = makeNeutralCanvas(128, 128, 128);
  const placeholderDark = makeNeutralCanvas(2, 4, 9);
  const placeholderNormal = makeNeutralCanvas(128, 128, 255);

  const loadTex = (
    url: string,
    srgb: boolean,
    repeat?: [number, number],
    equirect = false,
    critical = false,
    darkPlaceholder = false
  ): THREE.Texture => {
    const tex = new THREE.Texture(
      darkPlaceholder ? placeholderDark : srgb ? placeholderColor : placeholderNormal
    );
    tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.anisotropy = maxAniso;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    if (repeat) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
    } else {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    }
    if (equirect) {
      tex.mapping = THREE.EquirectangularReflectionMapping;
    }
    tex.needsUpdate = true;
    tracked.push(tex);

    if (critical) {
      const p = new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (disposed) {
            resolve();
            return;
          }
          const apply = () => {
            if (!disposed) {
              tex.image = img;
              tex.needsUpdate = true;
              renderer.initTexture(tex);
            }
            resolve();
          };
          if (typeof img.decode === 'function') {
            img.decode().then(apply, apply);
          } else {
            apply();
          }
        };
        img.onerror = () => resolve();
        img.src = url;
      });
      criticalPromises.push(p);
    } else {
      deferredQueue.push({ tex, url });
    }
    return tex;
  };

  const loadPbrSet = (
    prefix: string,
    repeat: [number, number],
    critical = false
  ): PbrTextureSet => ({
    map: loadTex(`/assets/textures/pbr/${prefix}_diff.jpg`, true, repeat, false, critical),
    normalMap: loadTex(`/assets/textures/pbr/${prefix}_nor.jpg`, false, repeat, false, critical),
    roughnessMap: loadTex(`/assets/textures/pbr/${prefix}_rough.jpg`, false, repeat, false, critical),
  });

  const cityAerial = createCityAerialTextures(renderer);
  tracked.push(cityAerial.map, cityAerial.emissiveMap);

  const trainLivery = createTrainLiveryTexture(renderer);
  tracked.push(trainLivery);

  const balloonCanopy = createHotAirBalloonTexture(renderer);
  const wickerWeave = createWickerWeaveTexture(renderer);
  const runwayMap = createRunwaySurfaceTexture(renderer);
  tracked.push(balloonCanopy, wickerWeave, runwayMap);

  const createStationSign = (code: string, title: string, numberLabel: string): THREE.CanvasTexture => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'rgb(15, 23, 42)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = 'rgb(234, 88, 12)';
    ctx.fillRect(0, 0, 512, 12);
    ctx.fillStyle = 'rgb(16, 185, 129)';
    ctx.fillRect(18, 28, 74, 72);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(numberLabel, 55, 76);
    ctx.textAlign = 'left';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = 'rgb(241, 245, 249)';
    ctx.fillText(code, 112, 60);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgb(148, 163, 184)';
    ctx.fillText(title, 112, 92);

    const signTex = new THREE.CanvasTexture(c);
    signTex.colorSpace = THREE.SRGBColorSpace;
    signTex.anisotropy = maxAniso;
    tracked.push(signTex);
    return signTex;
  };

  const asphalt = loadPbrSet('asphalt', [1.2, 28], true);
  const concrete = loadPbrSet('concrete', [2, 16], true);
  const terrain = loadPbrSet('terrain', [24, 42], true);
  const metal = loadPbrSet('metal', [3, 3], true);

  const milkyWay = loadTex('/assets/textures/planets/milky_way_2k.jpg', true, undefined, true, false, true);
  const ballast = loadPbrSet('ballast', [1.5, 44]);
  const wood = loadPbrSet('wood', [2, 2]);
  const earthDay = loadTex('/assets/textures/planets/earth_day_2048.jpg', true);
  const earthNight = loadTex('/assets/textures/planets/earth_night_2048.png', true, undefined, false, false, true);
  const earthNormal = loadTex('/assets/textures/planets/earth_normal_2048.jpg', false);
  const earthSpecular = loadTex('/assets/textures/planets/earth_specular_2048.jpg', false);
  const earthClouds = loadTex('/assets/textures/planets/earth_clouds_2k.jpg', false);
  const mars = loadTex('/assets/textures/planets/mars_2k.jpg', true);
  const jupiter = loadTex('/assets/textures/planets/jupiter_2k.jpg', true);
  const saturn = loadTex('/assets/textures/planets/saturn_2k.jpg', true);
  const saturnRingAlpha = loadTex('/assets/textures/planets/saturn_ring_alpha_2k.png', true);
  const moon = loadTex('/assets/textures/planets/moon_2k.jpg', true);
  const venus = loadTex('/assets/textures/planets/venus_2k.jpg', true);
  const mercury = loadTex('/assets/textures/planets/mercury_2k.jpg', true);
  const neptune = loadTex('/assets/textures/planets/neptune_2k.jpg', true, undefined, false, false, true);
  const fabricNormal = loadTex('/assets/textures/pbr/fabric_nor.jpg', false, [16, 10]);
  const fabricRoughness = loadTex('/assets/textures/pbr/fabric_rough.jpg', false, [16, 10]);
  const leather = loadPbrSet('leather', [2, 1]);

  const startDeferredLoads = () => {
    if (deferredStarted || disposed) return;
    deferredStarted = true;
    let idx = 0;

    const runIdle = (fn: () => void, timeoutMs: number) => {
      if (disposed) return;
      const win = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof win.requestIdleCallback === 'function') {
        win.requestIdleCallback(() => {
          if (!disposed) fn();
        }, { timeout: timeoutMs });
      } else {
        window.setTimeout(() => {
          if (!disposed) fn();
        }, 16);
      }
    };

    const scheduleNext = (delayMs: number) => {
      if (disposed) return;
      window.setTimeout(() => {
        runIdle(loadNext, 500);
      }, delayMs);
    };

    const loadNext = () => {
      if (disposed || idx >= deferredQueue.length) return;
      const item = deferredQueue[idx++];
      const isPlanetAsset = item.url.includes('/planets/');
      const img = new Image();
      img.decoding = 'async';
      const advance = () => scheduleNext(75);
      img.onload = () => {
        if (disposed) return;
        const commit = () => {
          runIdle(() => {
            if (!disposed) {
              item.tex.dispose();
              item.tex.image = img;
              item.tex.needsUpdate = true;
              if (!isPlanetAsset) {
                renderer.initTexture(item.tex);
              }
            }
            advance();
          }, 600);
        };
        if (typeof img.decode === 'function') {
          img.decode().then(commit, commit);
        } else {
          commit();
        }
      };
      img.onerror = advance;
      img.src = item.url;
    };

    scheduleNext(180);
  };

  return {
    earthDay,
    earthNight,
    earthNormal,
    earthSpecular,
    earthClouds,
    mars,
    jupiter,
    saturn,
    saturnRingAlpha,
    moon,
    venus,
    mercury,
    neptune,
    milkyWay,
    asphalt,
    ballast,
    concrete,
    terrain,
    wood,
    metal,
    fabricNormal,
    fabricRoughness,
    leather,
    balloonCanopy,
    wickerWeave,
    cityAerial,
    trainLivery,
    runwayMap,
    criticalReady: Promise.all(criticalPromises).then(() => undefined),
    startDeferredLoads,
    createStationSign,
    dispose() {
      disposed = true;
      tracked.forEach((t) => t.dispose());
    },
  };
}
