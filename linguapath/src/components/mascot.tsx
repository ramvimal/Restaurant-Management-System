// "Pip" — LinguaPath's original mascot: a round little lantern-fox.
// Pure inline SVG, no external assets.
"use client";

import { motion } from "framer-motion";

export function Mascot({ size = 120, animate = true, mood = "happy" }: { size?: number; animate?: boolean; mood?: "happy" | "thinking" | "celebrate" }) {
  const mouth =
    mood === "thinking" ? (
      <path d="M58 78 q7 -4 14 0" stroke="#7c4a21" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    ) : (
      <path d="M54 76 q11 10 22 0 q-11 4 -22 0" fill="#7c4a21" />
    );
  const inner = (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Pip, the LinguaPath fox">
      {/* tail */}
      <ellipse cx="96" cy="92" rx="18" ry="12" fill="#f5a623" transform="rotate(-24 96 92)" />
      <ellipse cx="102" cy="88" rx="8" ry="6" fill="#ffe3b3" transform="rotate(-24 102 88)" />
      {/* ears */}
      <path d="M28 44 L22 12 L52 30 Z" fill="#f5a623" />
      <path d="M92 44 L98 12 L68 30 Z" fill="#f5a623" />
      <path d="M30 34 L27 20 L42 29 Z" fill="#ffe3b3" />
      <path d="M90 34 L93 20 L78 29 Z" fill="#ffe3b3" />
      {/* body */}
      <ellipse cx="60" cy="70" rx="40" ry="36" fill="#ffcf6e" />
      <ellipse cx="60" cy="82" rx="24" ry="20" fill="#fff3dd" />
      {/* scarf */}
      <path d="M24 62 q36 18 72 0 l-4 12 q-32 16 -64 0 Z" fill="#0cc78c" />
      <rect x="72" y="66" width="12" height="22" rx="6" fill="#04a071" transform="rotate(12 78 77)" />
      {/* eyes */}
      {mood === "celebrate" ? (
        <>
          <path d="M38 52 q6 -7 12 0" stroke="#7c4a21" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M70 52 q6 -7 12 0" stroke="#7c4a21" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="44" cy="53" r="5.5" fill="#3b2a1a" />
          <circle cx="76" cy="53" r="5.5" fill="#3b2a1a" />
          <circle cx="46" cy="51" r="1.8" fill="#fff" />
          <circle cx="78" cy="51" r="1.8" fill="#fff" />
        </>
      )}
      {/* cheeks + nose + mouth */}
      <circle cx="34" cy="64" r="4.5" fill="#ffb3a0" opacity="0.9" />
      <circle cx="86" cy="64" r="4.5" fill="#ffb3a0" opacity="0.9" />
      <ellipse cx="60" cy="68" rx="4.5" ry="3.5" fill="#3b2a1a" />
      {mood !== "thinking" && mouth}
      {mood === "thinking" && mouth}
      {/* spark */}
      <path d="M100 34 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#ffd75e" />
    </svg>
  );
  if (!animate) return inner;
  return (
    <motion.div animate={{ y: [0, -8, 0], rotate: [0, 1.5, -1.5, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
      {inner}
    </motion.div>
  );
}

export function MascotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl border-2 border-slate-200 bg-white p-4 text-base font-bold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
      <div className="absolute -left-2.5 top-8 h-4 w-4 rotate-45 border-b-2 border-l-2 border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800" />
      {children}
    </div>
  );
}
