import { engineState, notifyEngineUi } from '../data/portfolioJourney';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let bgmAudio: HTMLAudioElement | null = null;
let windGain: GainNode | null = null;
let engineGain: GainNode | null = null;
let engineOsc: OscillatorNode | null = null;
let engineFilter: BiquadFilterNode | null = null;
let windFilter: BiquadFilterNode | null = null;
let initialized = false;
let unlockBound = false;

function buildNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
  }
  return buffer;
}

function initGraph(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (initialized) return audioCtx;
  initialized = true;

  const ctx = audioCtx;
  const now = ctx.currentTime;

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.connect(ctx.destination);

  bgmAudio = new Audio('/assets/audio/backsound.mp3');
  bgmAudio.loop = true;
  bgmAudio.preload = 'auto';

  bgmGain = ctx.createGain();
  bgmGain.gain.setValueAtTime(0.55, now);
  const bgmSource = ctx.createMediaElementSource(bgmAudio);
  bgmSource.connect(bgmGain);
  bgmGain.connect(masterGain);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buildNoiseBuffer(ctx, 3);
  noiseSource.loop = true;

  windFilter = ctx.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.setValueAtTime(340, now);
  windFilter.Q.setValueAtTime(0.9, now);

  windGain = ctx.createGain();
  windGain.gain.setValueAtTime(0.012, now);
  noiseSource.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(masterGain);
  noiseSource.start(now);

  engineOsc = ctx.createOscillator();
  engineOsc.type = 'sawtooth';
  engineOsc.frequency.setValueAtTime(64, now);

  engineFilter = ctx.createBiquadFilter();
  engineFilter.type = 'lowpass';
  engineFilter.frequency.setValueAtTime(145, now);

  engineGain = ctx.createGain();
  engineGain.gain.setValueAtTime(0.01, now);
  engineOsc.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(masterGain);
  engineOsc.start(now);

  return ctx;
}

function startBacksound(): void {
  if (!bgmAudio || !engineState.audioEnabled) return;
  if (bgmAudio.paused) {
    bgmAudio.play().catch(() => {});
  }
}

export function installAudioAutoUnlock(): void {
  if (typeof window === 'undefined' || unlockBound) return;
  unlockBound = true;

  const events = ['pointerdown', 'click', 'keydown', 'touchstart'] as const;
  const handleFirstGesture = () => {
    events.forEach((ev) => window.removeEventListener(ev, handleFirstGesture));
    if (!engineState.audioEnabled) return;
    const ctx = initGraph();
    if (ctx && masterGain) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      masterGain.gain.setTargetAtTime(0.65, ctx.currentTime, 0.35);
      startBacksound();
    }
  };

  events.forEach((ev) => window.addEventListener(ev, handleFirstGesture, { passive: true }));
}

export function updateAmbientAudio(progressT: number, velocity: number, pulse: number): void {
  if (!engineState.audioEnabled || !audioCtx || !initialized) return;
  if (audioCtx.state !== 'running') return;
  const now = audioCtx.currentTime;
  const speedNorm = Math.min(1, Math.abs(velocity) * 0.45 + pulse * 0.5);

  if (engineOsc && engineFilter && engineGain && windFilter && windGain) {
    let baseFreq = 66;
    let engFilterHz = 140;
    let engLevel = 0.01;
    let windHz = 320;
    let windLevel = 0.012;

    if (progressT < 1.65) {
      baseFreq = 62 + speedNorm * 42;
      engFilterHz = 135 + speedNorm * 140;
      engLevel = 0.01 + speedNorm * 0.016;
      windHz = 280 + speedNorm * 220;
      windLevel = 0.008 + speedNorm * 0.014;
    } else if (progressT < 5.5) {
      baseFreq = 86 + speedNorm * 34;
      engFilterHz = 175 + speedNorm * 110;
      engLevel = 0.008 + speedNorm * 0.014;
      windHz = 420 + speedNorm * 260;
      windLevel = 0.012 + speedNorm * 0.016;
    } else if (progressT < 8.5) {
      baseFreq = 98 + speedNorm * 45;
      engFilterHz = 210 + speedNorm * 160;
      engLevel = 0.008 + speedNorm * 0.014;
      windHz = 540 + speedNorm * 320;
      windLevel = 0.018 + speedNorm * 0.02;
    } else {
      baseFreq = 48 + speedNorm * 24;
      engFilterHz = 110 + speedNorm * 130;
      engLevel = 0.01 + speedNorm * 0.016;
      windHz = 220;
      windLevel = 0.002;
    }

    engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.14);
    engineFilter.frequency.setTargetAtTime(engFilterHz, now, 0.16);
    engineGain.gain.setTargetAtTime(engLevel, now, 0.16);
    windFilter.frequency.setTargetAtTime(windHz, now, 0.2);
    windGain.gain.setTargetAtTime(windLevel, now, 0.2);
  }
}

export function toggleSoundEngine(): boolean {
  const next = !engineState.audioEnabled;
  engineState.audioEnabled = next;
  const ctx = next ? initGraph() : audioCtx;

  if (next && ctx && masterGain) {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    masterGain.gain.setTargetAtTime(0.65, ctx.currentTime, 0.25);
    startBacksound();
    playPulseSfx(480);
  } else if (!next && ctx && masterGain) {
    masterGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12);
    if (bgmAudio && !bgmAudio.paused) {
      bgmAudio.pause();
    }
  }

  notifyEngineUi();
  return next;
}

export function playPulseSfx(baseFreq = 440): void {
  if (!engineState.audioEnabled || !audioCtx || !masterGain) return;
  if (audioCtx.state !== 'running') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + 0.09);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, now + 0.24);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.28);
}

export function playWaypointSfx(stopIndex: number): void {
  if (!engineState.audioEnabled || !audioCtx || !masterGain) return;
  if (audioCtx.state !== 'running') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const scale = [220, 246.94, 293.66, 329.63, 392.0, 440.0];
  const freq = scale[stopIndex % scale.length];
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + 0.14);
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.18);
}
