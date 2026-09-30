// Tiny WebAudio sound effects — no audio assets needed.
"use client";

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, startAt: number, dur: number, type: OscillatorType = "sine", vol = 0.16) {
  const c = ac();
  if (!c || !enabled) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, c.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(vol, c.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + startAt + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(c.currentTime + startAt);
    osc.stop(c.currentTime + startAt + dur + 0.05);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  click: () => tone(660, 0, 0.08, "triangle"),
  pop: () => { tone(520, 0, 0.09, "sine"); tone(780, 0.06, 0.12, "sine"); },
  correct: () => { tone(523.25, 0, 0.12); tone(659.25, 0.09, 0.12); tone(783.99, 0.18, 0.2); },
  wrong: () => { tone(220, 0, 0.18, "sawtooth", 0.08); tone(174.6, 0.12, 0.25, "sawtooth", 0.08); },
  complete: () => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.22)); },
  streak: () => { tone(392, 0, 0.12); tone(523.25, 0.1, 0.12); tone(659.25, 0.2, 0.25); },
};
