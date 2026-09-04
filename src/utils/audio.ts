// Web Audio API Synthesizer - 100% self-contained, no external asset dependencies

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getContext(): AudioContext | null {
  if (isMuted) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function toggleAudio(muted?: boolean): boolean {
  if (muted !== undefined) {
    isMuted = muted;
  } else {
    isMuted = !isMuted;
  }
  return !isMuted;
}

export function isAudioEnabled(): boolean {
  return !isMuted;
}

export function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.1, delay = 0) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  } catch {}
}

const FLIP_NOTES = [220, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25];

export function sfxCardFlip(index = 0) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime;
    // Kick drum snap
    const kick = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kick.type = 'triangle';
    kick.frequency.setValueAtTime(170, t0);
    kick.frequency.exponentialRampToValueAtTime(45, t0 + 0.08);
    kickGain.gain.setValueAtTime(0.25, t0);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
    kick.connect(kickGain);
    kickGain.connect(ctx.destination);
    kick.start(t0);
    kick.stop(t0 + 0.09);

    const note = FLIP_NOTES[Math.min(Math.max(index, 0), FLIP_NOTES.length - 1)];
    playTone(note, 0.16, 'sine', 0.12, 0.02);
  } catch {}
}

export function sfxClick() {
  playTone(420, 0.05, 'sine', 0.08);
}

export function sfxWhistle() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime;
    // High-pitched referee whistle with tremolo
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600, t0);
    osc.frequency.linearRampToValueAtTime(3200, t0 + 0.1);
    osc.frequency.linearRampToValueAtTime(2800, t0 + 0.25);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.32);

    // Second chirp
    setTimeout(() => {
      playTone(3100, 0.2, 'sine', 0.16);
    }, 140);
  } catch {}
}

export function sfxGoal() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    // Stadium goal blast chords
    const chord = [261.63, 329.63, 392.0, 523.25];
    chord.forEach((freq, i) => {
      playTone(freq, 1.2, 'triangle', 0.18, i * 0.08);
      playTone(freq * 1.5, 0.8, 'sawtooth', 0.05, i * 0.08 + 0.05);
    });
  } catch {}
}

export function sfxSpendCoins() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    // Crisp coin jingle & cash register chime
    playTone(987.77, 0.25, 'sine', 0.2, 0);       // B5
    playTone(1318.51, 0.35, 'sine', 0.22, 0.08);   // E6
    playTone(1567.98, 0.4, 'triangle', 0.18, 0.16); // G6
    playTone(1975.53, 0.5, 'sine', 0.2, 0.24);    // B6
  } catch {}
}

export function sfxApplause() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    // Cheering stadium burst with rhythmic clapping
    for (let i = 0; i < 12; i++) {
      const delay = Math.random() * 0.9;
      const freq = 200 + Math.random() * 350;
      playTone(freq, 0.12, 'triangle', 0.08, delay);
    }
  } catch {}
}

export function sfxWalkoutReveal(ovr = 90) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime;
    if (ovr >= 90) {
      // Powerful swoosh buildup
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t0);
      osc.frequency.exponentialRampToValueAtTime(1100, t0 + 0.45);
      gain.gain.setValueAtTime(0.02, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.52);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.55);

      // Heavy explosion bass + fanfare
      playTone(55, 1.0, 'triangle', 0.35, 0.46);
      playTone(523.25, 0.7, 'sine', 0.22, 0.48);
      playTone(659.25, 0.7, 'sine', 0.24, 0.56);
      playTone(783.99, 0.8, 'triangle', 0.26, 0.64);
      playTone(1046.5, 1.0, 'sine', 0.3, 0.74);
    } else if (ovr >= 82) {
      playTone(440, 0.3, 'triangle', 0.18, 0);
      playTone(554.37, 0.35, 'triangle', 0.2, 0.1);
      playTone(659.25, 0.5, 'sine', 0.24, 0.22);
    } else {
      playTone(349.23, 0.25, 'sine', 0.15, 0);
      playTone(440.0, 0.35, 'sine', 0.18, 0.12);
    }
  } catch {}
}
