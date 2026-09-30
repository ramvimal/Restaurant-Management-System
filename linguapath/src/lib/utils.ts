import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLearners(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

/** Loose answer comparison: case/punctuation/whitespace-insensitive. */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFC")
    .replace(/[¡!¿?.,;:'"“”‘’()\-—]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCjkLocale(ttsLocale: string): boolean {
  return ttsLocale.startsWith("ko") || ttsLocale.startsWith("ja") || ttsLocale.startsWith("zh");
}
