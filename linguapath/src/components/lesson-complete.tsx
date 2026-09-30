// Celebration screen: XP count-up, accuracy, streak, achievements, confetti.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Mascot } from "./mascot";
import { Button } from "./ui";
import { sfx } from "@/lib/sounds";

export type AchievementDTO = { id: string; title: string; description: string; icon: string; xpBonus: number };

type Props = {
  mode: "lesson" | "practice" | "placement";
  xp: number;
  accuracy: number;
  streak?: number;
  streakIncreased?: boolean;
  gemsEarned?: number;
  achievements?: AchievementDTO[];
  headline?: string;
  subline?: string;
  primaryHref: string;
  primaryLabel: string;
  extra?: React.ReactNode;
};

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function LessonComplete({ mode, xp, accuracy, streak, streakIncreased, gemsEarned, achievements = [], headline, subline, primaryHref, primaryLabel, extra }: Props) {
  const shown = useCountUp(xp);

  useEffect(() => {
    sfx.complete();
    const defaults = { disableForReducedMotion: true };
    confetti({ ...defaults, particleCount: 120, spread: 75, origin: { y: 0.6 }, zIndex: 200 });
    const t = setTimeout(() => confetti({ ...defaults, particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, zIndex: 200 }), 250);
    const t2 = setTimeout(() => confetti({ ...defaults, particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, zIndex: 200 }), 400);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const title = headline ?? (mode === "practice" ? "Practice complete!" : mode === "placement" ? "Level check done!" : accuracy === 100 ? "Flawless victory!" : accuracy >= 80 ? "Lesson complete!" : "Good effort!");
  const body = subline ?? (mode === "practice" ? "Your brain thanks you. 🧠" : "Every lesson makes Pip do a happy dance.");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-4 py-10 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
        <Mascot size={140} mood="celebrate" />
      </motion.div>
      <h1 className="mt-2 text-3xl font-black text-sun-500">{title}</h1>
      <p className="mt-1 font-bold text-slate-500">{body}</p>

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <div className="rounded-3xl border-2 border-sun-300 bg-sun-300/20 p-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-amber-600">XP earned</p>
          <p className="text-3xl font-black text-amber-500">+{shown}</p>
        </div>
        <div className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">Accuracy</p>
          <p className="text-3xl font-black text-brand-500">{accuracy}%</p>
        </div>
      </div>

      {(streak !== undefined || gemsEarned !== undefined) && (
        <div className="mt-3 flex w-full gap-3">
          {streak !== undefined && (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-50 p-3 font-extrabold text-orange-600 dark:bg-orange-950">
              🔥 {streak}-day streak{streakIncreased ? "!" : ""}
            </div>
          )}
          {gemsEarned !== undefined && (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-50 p-3 font-extrabold text-sky-600 dark:bg-sky-950">
              💎 +{gemsEarned} gems
            </div>
          )}
        </div>
      )}

      {achievements.length > 0 && (
        <div className="mt-4 w-full rounded-3xl border-2 border-grape-400/40 bg-grape-500/10 p-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-grape-600">🏆 Achievements unlocked</p>
          <div className="mt-2 flex flex-col gap-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-white p-2 text-left dark:bg-slate-800">
                <span className="text-3xl">{a.icon}</span>
                <span>
                  <span className="block text-sm font-extrabold">{a.title} <span className="text-sun-500">+{a.xpBonus} XP</span></span>
                  <span className="block text-xs font-bold text-slate-400">{a.description}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {extra}

      <Link href={primaryHref} className="mt-6 w-full">
        <Button size="lg" className="w-full">{primaryLabel}</Button>
      </Link>
    </div>
  );
}
