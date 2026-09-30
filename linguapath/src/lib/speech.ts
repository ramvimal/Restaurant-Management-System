// Web Speech API helpers: text-to-speech + optional speech recognition.
"use client";

export function speak(text: string, locale: string, rate = 0.92): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = locale;
    utter.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang.toLowerCase().startsWith(locale.toLowerCase())) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(locale.slice(0, 2).toLowerCase()));
    if (match) utter.voice = match;
    window.speechSynthesis.speak(utter);
  } catch {
    /* TTS unavailable — fail silently */
  }
}

export function preloadVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

type Recog = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function speechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function createRecognizer(
  locale: string,
  onResult: (transcript: string) => void,
  onEnd?: () => void,
  onError?: (e: unknown) => void
): { start: () => void; stop: () => void } | null {
  if (!speechRecognitionSupported()) return null;
  const w = window as unknown as Record<string, new () => Recog>;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  const recog = new Ctor();
  recog.lang = locale;
  recog.interimResults = false;
  recog.maxAlternatives = 3;
  recog.onresult = (e) => {
    const last = e.results[e.results.length - 1];
    onResult(last?.[0]?.transcript ?? "");
  };
  recog.onend = () => onEnd?.();
  recog.onerror = (e) => onError?.(e);
  return {
    start: () => { try { recog.start(); } catch { /* already started */ } },
    stop: () => { try { recog.stop(); } catch { /* noop */ } },
  };
}
