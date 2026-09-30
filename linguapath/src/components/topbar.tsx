// HUD top bar: streak, gems, hearts, daily-goal ring.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Logo } from "./nav";

export function GoalRing({ progress, goal, size = 40 }: { progress: number; goal: number; size?: number }) {
  const pct = goal > 0 ? Math.min(1, progress / goal) : 0;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const done = pct >= 1;
  return (
    <div className="relative" title={`Daily goal: ${progress}/${goal} XP`} role="img" aria-label={`Daily goal ${progress} of ${goal} XP`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="5" className="stroke-slate-200 dark:stroke-slate-700" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="5" strokeLinecap="round"
          className={done ? "stroke-sun-400" : "stroke-brand-500"} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm">{done ? "🎯" : "⭐"}</span>
    </div>
  );
}

function useCountdown(targetIso: string | null) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!targetIso) { setLabel(""); return; }
    const tick = () => {
      const ms = new Date(targetIso).getTime() - Date.now();
      if (ms <= 0) { setLabel("soon"); return; }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLabel(`${m}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [targetIso]);
  return label;
}

export function Topbar() {
  const stats = useAppStore((s) => s.stats);
  const refreshMe = useAppStore((s) => s.refreshMe);
  const refillIn = useCountdown(stats?.nextRefillAt ?? null);

  useEffect(() => {
    const t = setInterval(() => void refreshMe(), 60000);
    return () => clearInterval(t);
  }, [refreshMe]);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5">
        <div className="md:hidden">
          <Logo compact />
        </div>
        <div className="hidden text-sm font-extrabold text-slate-400 md:block">Keep the streak alive! 🔥</div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800" title="Day streak" aria-label={`Streak: ${stats?.streak ?? 0} days`}>
            <span className="text-base">🔥</span>
            <span className="text-sm font-extrabold text-orange-500">{stats?.streak ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800" title="Gems" aria-label={`Gems: ${stats?.gems ?? 0}`}>
            <span className="text-base">💎</span>
            <span className="text-sm font-extrabold text-sky-500">{stats?.gems ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800" title={stats && stats.hearts < stats.heartsMax ? `Next heart in ${refillIn}` : "Hearts (refill over time or via Practice)"} aria-label={`Hearts: ${stats?.hearts ?? 5} of ${stats?.heartsMax ?? 5}`}>
            <span className="text-base">❤️</span>
            <span className="text-sm font-extrabold text-rose-500">
              {stats?.hearts ?? 5}
              {stats && stats.hearts < stats.heartsMax && refillIn && <span className="ml-1 text-[11px] font-bold text-slate-400">{refillIn}</span>}
            </span>
          </div>
          <Link href="/profile" aria-label="Daily goal progress">
            <GoalRing progress={stats?.goalProgress ?? 0} goal={stats?.goalXp ?? 20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
