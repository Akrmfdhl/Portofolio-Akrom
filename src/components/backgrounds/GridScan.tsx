import { useEffect, useRef, memo } from 'react';
import './GridScan.css';

interface GridScanProps {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineJitter?: number;
  noiseIntensity?: number;
  bloomIntensity?: number;
  scanGlow?: number;
  scanSoftness?: number;
  scanPhaseTaper?: number;
  scanDuration?: number;
  scanDelay?: number;
  scanDirection?: 'forward' | 'backward' | 'pingpong';
  scanOnClick?: boolean;
  snapBackDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Vec2 {
  x: number;
  y: number;
}

const vertShaderSource = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragShaderSource = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
varying vec2 vUv;

uniform float uScanStarts[8];
uniform float uScanCount;

const int MAX_SCANS = 8;

float smoother01(float a, float b, float x) {
  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

  vec3 ro = vec3(0.0);
  vec3 rd = normalize(vec3(p, 2.0));

  float cR = cos(uTilt), sR = sin(uTilt);
  rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;

  float cY = cos(uYaw), sY = sin(uYaw);
  rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

  vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
  rd.xy += skew * rd.z;

  vec3 color = vec3(0.0);
  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
  float fadeStrength = 2.0;
  vec2 gridUV = vec2(0.0);

  float hitIsY = 1.0;
  for (int i = 0; i < 4; i++) {
    float isY = float(i < 2);
    float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
    float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
    float den = isY * rd.y + (1.0 - isY) * rd.x;
    float t = num / den;
    vec3 h = ro + rd * t;

    float depthBoost = smoothstep(0.0, 3.0, h.z);
    h.xy += skew * 0.15 * depthBoost;

    bool use = t > 0.0 && t < minT;
    gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
  }

  vec3 hit = ro + rd * minT;
  float dist = length(hit - ro);

  float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
  if (jitterAmt > 0.0) {
    vec2 j = vec2(
      sin(gridUV.y * 2.7 + iTime * 1.8),
      cos(gridUV.x * 2.3 - iTime * 1.6)
    ) * (0.15 * jitterAmt);
    gridUV += j;
  }
  float fx = fract(gridUV.x);
  float fy = fract(gridUV.y);
  float ax = min(fx, 1.0 - fx);
  float ay = min(fy, 1.0 - fy);
  float wx = fwidth(gridUV.x);
  float wy = fwidth(gridUV.y);
  float halfPx = max(0.0, uLineThickness) * 0.5;

  float tx = halfPx * wx;
  float ty = halfPx * wy;

  float aax = wx;
  float aay = wy;

  float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
  float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
  if (uLineStyle > 0.5) {
    float dashRepeat = 4.0;
    float dashDuty = 0.5;
    float vy = fract(gridUV.y * dashRepeat);
    float vx = fract(gridUV.x * dashRepeat);
    float dashMaskY = step(vy, dashDuty);
    float dashMaskX = step(vx, dashDuty);
    if (uLineStyle < 1.5) {
      lineX *= dashMaskY;
      lineY *= dashMaskX;
    } else {
      float dotRepeat = 6.0;
      float dotWidth = 0.18;
      float cy = abs(fract(gridUV.y * dotRepeat) - 0.5);
      float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
      float dotMaskY = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.y * dotRepeat), cy);
      float dotMaskX = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.x * dotRepeat), cx);
      lineX *= dotMaskY;
      lineY *= dotMaskX;
    }
  }
  float primaryMask = max(lineX, lineY);

  vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
  if (jitterAmt > 0.0) {
    vec2 j2 = vec2(
      cos(gridUV2.y * 2.1 - iTime * 1.4),
      sin(gridUV2.x * 2.5 + iTime * 1.7)
    ) * (0.15 * jitterAmt);
    gridUV2 += j2;
  }
  float fx2 = fract(gridUV2.x);
  float fy2 = fract(gridUV2.y);
  float ax2 = min(fx2, 1.0 - fx2);
  float ay2 = min(fy2, 1.0 - fy2);
  float wx2 = fwidth(gridUV2.x);
  float wy2 = fwidth(gridUV2.y);
  float tx2 = halfPx * wx2;
  float ty2 = halfPx * wy2;
  float aax2 = wx2;
  float aay2 = wy2;
  float lineX2 = 1.0 - smoothstep(tx2, tx2 + aax2, ax2);
  float lineY2 = 1.0 - smoothstep(ty2, ty2 + aay2, ay2);
  if (uLineStyle > 0.5) {
    float dashRepeat2 = 4.0;
    float dashDuty2 = 0.5;
    float vy2m = fract(gridUV2.y * dashRepeat2);
    float vx2m = fract(gridUV2.x * dashRepeat2);
    float dashMaskY2 = step(vy2m, dashDuty2);
    float dashMaskX2 = step(vx2m, dashDuty2);
    if (uLineStyle < 1.5) {
      lineX2 *= dashMaskY2;
      lineY2 *= dashMaskX2;
    } else {
      float dotRepeat2 = 6.0;
      float dotWidth2 = 0.18;
      float cy2 = abs(fract(gridUV2.y * dotRepeat2) - 0.5);
      float cx2 = abs(fract(gridUV2.x * dotRepeat2) - 0.5);
      float dotMaskY2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.y * dotRepeat2), cy2);
      float dotMaskX2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.x * dotRepeat2), cx2);
      lineX2 *= dotMaskY2;
      lineY2 *= dotMaskX2;
    }
  }
  float altMask = max(lineX2, lineY2);

  float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
  float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
  float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
  float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
  altMask *= edgeGate;

  float lineMask = max(primaryMask, altMask);
  float fade = exp(-dist * fadeStrength);

  float dur = max(0.05, uScanDuration);
  float del = max(0.0, uScanDelay);
  float scanZMax = 2.0;
  float widthScale = max(0.1, uScanGlow);
  float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
  float sigmaA = sigma * 2.0;

  float combinedPulse = 0.0;
  float combinedAura = 0.0;

  float cycle = dur + del;
  float tCycle = mod(iTime, cycle);
  float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
  float phase = scanPhase;
  if (uScanDirection > 0.5 && uScanDirection < 1.5) {
    phase = 1.0 - phase;
  } else if (uScanDirection > 1.5) {
    float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
    phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
  }
  float scanZ = phase * scanZMax;
  float dz = abs(hit.z - scanZ);
  float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
  float taper = clamp(uPhaseTaper, 0.0, 0.49);
  float headW = taper;
  float tailW = taper;
  float headFade = smoother01(0.0, headW, phase);
  float tailFade = 1.0 - smoother01(1.0 - tailW, 1.0, phase);
  float phaseWindow = headFade * tailFade;
  float pulseBase = lineBand * phaseWindow;
  combinedPulse += pulseBase * clamp(uScanOpacity, 0.0, 1.0);
  float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
  combinedAura += (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

  for (int i = 0; i < MAX_SCANS; i++) {
    if (float(i) >= uScanCount) break;
    float tActiveI = iTime - uScanStarts[i];
    float phaseI = clamp(tActiveI / dur, 0.0, 1.0);
    if (uScanDirection > 0.5 && uScanDirection < 1.5) {
      phaseI = 1.0 - phaseI;
    } else if (uScanDirection > 1.5) {
      phaseI = (phaseI < 0.5) ? (phaseI * 2.0) : (1.0 - (phaseI - 0.5) * 2.0);
    }
    float scanZI = phaseI * scanZMax;
    float dzI = abs(hit.z - scanZI);
    float lineBandI = exp(-0.5 * (dzI * dzI) / (sigma * sigma));
    float headFadeI = smoother01(0.0, headW, phaseI);
    float tailFadeI = 1.0 - smoother01(1.0 - tailW, 1.0, phaseI);
    float phaseWindowI = headFadeI * tailFadeI;
    combinedPulse += lineBandI * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
    float auraBandI = exp(-0.5 * (dzI * dzI) / (sigmaA * sigmaA));
    combinedAura += (auraBandI * 0.25) * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
  }

  float lineVis = lineMask;
  vec3 gridCol = uLinesColor * lineVis * fade;
  vec3 scanCol = uScanColor * combinedPulse;
  vec3 scanAura = uScanColor * combinedAura;

  color = gridCol + scanCol + scanAura;

  float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
  color += (n - 0.5) * uNoise;
  color = clamp(color, 0.0, 1.0);
  float alpha = clamp(max(lineVis, combinedPulse), 0.0, 1.0);
  float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + aax * 2.0, ax);
  float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + aay * 2.0, ay);
  float halo = max(gx, gy) * fade;
  alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));
  fragColor = vec4(color, alpha);
}

void main() {
  vec4 c;
  mainImage(c, vUv * iResolution.xy);
  gl_FragColor = c;
}
`;

function srgbColor(colorStr: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/\d+/g);
    if (match) {
      r = parseInt(match[0], 10) / 255;
      g = parseInt(match[1], 10) / 255;
      b = parseInt(match[2], 10) / 255;
    }
  } else {
    const cleanHex = colorStr.replace('#', '');
    r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    b = parseInt(cleanHex.slice(4, 6), 16) / 255;
  }
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return [toLinear(r), toLinear(g), toLinear(b)];
}

function smoothDampVec2(
  current: Vec2,
  target: Vec2,
  currentVelocity: Vec2,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
): Vec2 {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let changeX = current.x - target.x;
  let changeY = current.y - target.y;

  const maxChange = maxSpeed * smoothTime;
  const changeLength = Math.sqrt(changeX * changeX + changeY * changeY);
  if (changeLength > maxChange && changeLength > 0) {
    changeX = (changeX / changeLength) * maxChange;
    changeY = (changeY / changeLength) * maxChange;
  }

  const targetX = current.x - changeX;
  const targetY = current.y - changeY;

  const tempX = (currentVelocity.x + omega * changeX) * deltaTime;
  const tempY = (currentVelocity.y + omega * changeY) * deltaTime;

  currentVelocity.x = (currentVelocity.x - omega * tempX) * exp;
  currentVelocity.y = (currentVelocity.y - omega * tempY) * exp;

  let outputX = targetX + (changeX + tempX) * exp;
  let outputY = targetY + (changeY + tempY) * exp;

  const origMinusCurrentX = target.x - current.x;
  const origMinusCurrentY = target.y - current.y;
  const outMinusOrigX = outputX - target.x;
  const outMinusOrigY = outputY - target.y;

  if (origMinusCurrentX * outMinusOrigX + origMinusCurrentY * outMinusOrigY > 0) {
    outputX = target.x;
    outputY = target.y;
    currentVelocity.x = 0;
    currentVelocity.y = 0;
  }

  return { x: outputX, y: outputY };
}

function smoothDampFloat(
  current: number,
  target: number,
  velRef: { v: number },
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
) {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current - target;
  const originalTo = target;

  const maxChange = maxSpeed * smoothTime;
  change = Math.sign(change) * Math.min(Math.abs(change), maxChange);

  const targetVal = current - change;
  const temp = (velRef.v + omega * change) * deltaTime;
  velRef.v = (velRef.v - omega * temp) * exp;

  let out = targetVal + (change + temp) * exp;

  const origMinusCurrent = originalTo - current;
  const outMinusOrig = out - originalTo;
  if (origMinusCurrent * outMinusOrig > 0) {
    out = originalTo;
    velRef.v = 0;
  }
  return { value: out, v: velRef.v };
}

const GridScan = memo(({
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = 'rgb(47, 41, 58)',
  scanColor = 'rgb(255, 159, 252)',
  scanOpacity = 0.4,
  gridScale = 0.1,
  lineStyle = 'solid',
  lineJitter = 0.1,
  scanDirection = 'pingpong',
  noiseIntensity = 0.01,
  bloomIntensity = 0.6,
  scanGlow = 0.5,
  scanSoftness = 2,
  scanPhaseTaper = 0.9,
  scanDuration = 2.0,
  scanDelay = 2.0,
  scanOnClick = false,
  snapBackDelay = 250,
  className = '',
  style = {}
}: GridScanProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const lookTarget = useRef({ x: 0, y: 0 });
  const lookCurrent = useRef({ x: 0, y: 0 });
  const lookVel = useRef({ x: 0, y: 0 });

  const tiltTarget = useRef(0);
  const tiltCurrent = useRef(0);
  const tiltVel = useRef(0);

  const yawTarget = useRef(0);
  const yawCurrent = useRef(0);
  const yawVel = useRef(0);

  const MAX_SCANS = 8;
  const scanStartsRef = useRef<number[]>([]);

  const pushScan = (t: number) => {
    const arr = [...scanStartsRef.current];
    if (arr.length >= MAX_SCANS) arr.shift();
    arr.push(t);
    scanStartsRef.current = arr;
  };

  const sVal = Math.min(1, Math.max(0, sensitivity));
  const skewScale = 0.06 + (0.2 - 0.06) * sVal;
  const tiltScale = 0.12 + (0.3 - 0.12) * sVal;
  const yawScale = 0.1 + (0.28 - 0.1) * sVal;
  const smoothTime = 0.45 + (0.12 - 0.45) * sVal;
  const maxSpeed = Infinity;
  const yBoost = 1.2 + (1.6 - 1.2) * sVal;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let leaveTimer: number | null = null;

    const onMove = (e: MouseEvent) => {
      if (leaveTimer) {
        window.clearTimeout(leaveTimer);
        leaveTimer = null;
      }
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      lookTarget.current = { x: nx, y: ny };
    };

    const onClick = () => {
      const nowSec = performance.now() / 1000;
      if (scanOnClick) pushScan(nowSec);
    };

    const onLeave = () => {
      if (leaveTimer) window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => {
        lookTarget.current = { x: 0, y: 0 };
        tiltTarget.current = 0;
        yawTarget.current = 0;
      }, Math.max(0, snapBackDelay || 0));
    };

    el.addEventListener('mousemove', onMove);
    if (scanOnClick) el.addEventListener('click', onClick);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      if (scanOnClick) el.removeEventListener('click', onClick);
      el.removeEventListener('mouseleave', onLeave);
      if (leaveTimer) window.clearTimeout(leaveTimer);
    };
  }, [snapBackDelay, scanOnClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vertShaderSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fragShaderSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const posAttr = gl.getAttribLocation(program, 'position');
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Uniform locations
    const uResLoc = gl.getUniformLocation(program, 'iResolution');
    const uTimeLoc = gl.getUniformLocation(program, 'iTime');
    const uSkewLoc = gl.getUniformLocation(program, 'uSkew');
    const uTiltLoc = gl.getUniformLocation(program, 'uTilt');
    const uYawLoc = gl.getUniformLocation(program, 'uYaw');
    const uLineThicknessLoc = gl.getUniformLocation(program, 'uLineThickness');
    const uLinesColorLoc = gl.getUniformLocation(program, 'uLinesColor');
    const uScanColorLoc = gl.getUniformLocation(program, 'uScanColor');
    const uGridScaleLoc = gl.getUniformLocation(program, 'uGridScale');
    const uLineStyleLoc = gl.getUniformLocation(program, 'uLineStyle');
    const uLineJitterLoc = gl.getUniformLocation(program, 'uLineJitter');
    const uScanOpacityLoc = gl.getUniformLocation(program, 'uScanOpacity');
    const uScanDirectionLoc = gl.getUniformLocation(program, 'uScanDirection');
    const uNoiseLoc = gl.getUniformLocation(program, 'uNoise');
    const uBloomOpacityLoc = gl.getUniformLocation(program, 'uBloomOpacity');
    const uScanGlowLoc = gl.getUniformLocation(program, 'uScanGlow');
    const uScanSoftnessLoc = gl.getUniformLocation(program, 'uScanSoftness');
    const uPhaseTaperLoc = gl.getUniformLocation(program, 'uPhaseTaper');
    const uScanDurationLoc = gl.getUniformLocation(program, 'uScanDuration');
    const uScanDelayLoc = gl.getUniformLocation(program, 'uScanDelay');
    const uScanStartsLoc = gl.getUniformLocation(program, 'uScanStarts');
    const uScanCountLoc = gl.getUniformLocation(program, 'uScanCount');

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = 1;
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, w * dpr, h * dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    let last = performance.now();
    let isIntersecting = true;

    const tick = () => {
      if (!isIntersecting) return;

      const now = performance.now();
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;

      lookCurrent.current = smoothDampVec2(lookCurrent.current, lookTarget.current, lookVel.current, smoothTime, maxSpeed, dt);

      const tiltSm = smoothDampFloat(tiltCurrent.current, tiltTarget.current, { v: tiltVel.current }, smoothTime, maxSpeed, dt);
      tiltCurrent.current = tiltSm.value;
      tiltVel.current = tiltSm.v;

      const yawSm = smoothDampFloat(yawCurrent.current, yawTarget.current, { v: yawVel.current }, smoothTime, maxSpeed, dt);
      yawCurrent.current = yawSm.value;
      yawVel.current = yawSm.v;

      gl.useProgram(program);

      // Bind positions
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      // Uniforms
      gl.uniform3f(uResLoc, w * dpr, h * dpr, dpr);
      gl.uniform1f(uTimeLoc, now / 1000);
      gl.uniform2f(uSkewLoc, lookCurrent.current.x * skewScale, -lookCurrent.current.y * yBoost * skewScale);
      gl.uniform1f(uTiltLoc, tiltCurrent.current * tiltScale);
      gl.uniform1f(uYawLoc, Math.min(0.6, Math.max(-0.6, yawCurrent.current * yawScale)));

      gl.uniform1f(uLineThicknessLoc, lineThickness);
      const linesCol = srgbColor(linesColor);
      gl.uniform3f(uLinesColorLoc, linesCol[0], linesCol[1], linesCol[2]);
      const scanCol = srgbColor(scanColor);
      gl.uniform3f(uScanColorLoc, scanCol[0], scanCol[1], scanCol[2]);

      gl.uniform1f(uGridScaleLoc, gridScale);
      gl.uniform1f(uLineStyleLoc, lineStyle === 'dashed' ? 1.0 : lineStyle === 'dotted' ? 2.0 : 0.0);
      gl.uniform1f(uLineJitterLoc, Math.max(0, Math.min(1, lineJitter)));
      gl.uniform1f(uScanOpacityLoc, scanOpacity);
      gl.uniform1f(uScanDirectionLoc, scanDirection === 'backward' ? 1.0 : scanDirection === 'pingpong' ? 2.0 : 0.0);
      gl.uniform1f(uNoiseLoc, noiseIntensity);
      gl.uniform1f(uBloomOpacityLoc, bloomIntensity);
      gl.uniform1f(uScanGlowLoc, scanGlow);
      gl.uniform1f(uScanSoftnessLoc, scanSoftness);
      gl.uniform1f(uPhaseTaperLoc, scanPhaseTaper);
      gl.uniform1f(uScanDurationLoc, scanDuration);
      gl.uniform1f(uScanDelayLoc, scanDelay);

      // Multi scan starts
      const scanStartsArr = new Float32Array(MAX_SCANS);
      for (let i = 0; i < MAX_SCANS; i++) {
        scanStartsArr[i] = scanStartsRef.current[i] || 0;
      }
      gl.uniform1fv(uScanStartsLoc, scanStartsArr);
      gl.uniform1f(uScanCountLoc, scanStartsRef.current.length);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasIntersecting = isIntersecting;
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && !wasIntersecting) {
          last = performance.now();
          tick();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [
    sensitivity,
    lineThickness,
    linesColor,
    scanColor,
    scanOpacity,
    gridScale,
    lineStyle,
    lineJitter,
    scanDirection,
    noiseIntensity,
    bloomIntensity,
    scanGlow,
    scanSoftness,
    scanPhaseTaper,
    scanDuration,
    scanDelay,
    skewScale,
    tiltScale,
    yawScale,
    smoothTime,
    yBoost,
    maxSpeed
  ]);

  return (
    <div ref={containerRef} className={`gridscan ${className}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  );
});

GridScan.displayName = 'GridScan';

export default GridScan;
