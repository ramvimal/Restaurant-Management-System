// Settings: theme, prefs, daily goal, hearts, logout.
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button, Card, Spinner } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { SignOutButton } from "@/components/account-actions";
import { GEM_REFILL_COST, HEARTS_MAX } from "@/lib/game-client";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const stats = useAppStore((s) => s.stats);
  const showReadingAid = useAppStore((s) => s.showReadingAid);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const setPrefs = useAppStore((s) => s.setPrefs);
  const refreshMe = useAppStore((s) => s.refreshMe);
  const pushToast = useAppStore((s) => s.pushToast);
  const [goal, setGoal] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); void refreshMe(); }, [refreshMe]);
  useEffect(() => { if (stats) setGoal(Math.round(stats.goalXp / 2)); }, [stats]);

  async function savePrefs(patch: { showReadingAid?: boolean; soundEnabled?: boolean }) {
    setPrefs(patch);
    await fetch("/api/prefs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
  }

  async function saveGoal(min: number) {
    setGoal(min);
    setSaving(true);
    try {
      const res = await fetch("/api/set-goal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dailyGoalMin: min }) });
      if (!res.ok) throw new Error();
      pushToast({ title: "Goal updated 🎯", body: `${min} minutes a day — you've got this!`, icon: "🎯" });
      void refreshMe();
    } catch {
      pushToast({ title: "Couldn't save goal", icon: "😕" });
    } finally {
      setSaving(false);
    }
  }

  async function refill() {
    const res = await fetch("/api/hearts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "refill" }) });
    const data = await res.json();
    if (!res.ok) {
      pushToast({ title: "Can't refill", body: data.error, icon: "💎" });
      return;
    }
    pushToast({ title: "Hearts full! ❤️", icon: "❤️" });
    void refreshMe();
  }

  if (!mounted || !stats) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">Settings</h1>

      <Card>
        <h2 className="font-black">🎨 Appearance</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)} aria-pressed={theme === t}
              className={cn("rounded-2xl border-2 p-3 text-sm font-extrabold capitalize", theme === t ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950" : "border-slate-200 dark:border-slate-700")}>
              {t === "light" ? "☀️" : t === "dark" ? "🌙" : "💻"} {t}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-black">🎯 Daily goal</h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[5, 10, 15, 20].map((m) => (
            <button key={m} onClick={() => saveGoal(m)} disabled={saving} aria-pressed={goal === m}
              className={cn("rounded-2xl border-2 p-3 text-center", goal === m ? "border-brand-400 bg-brand-50 dark:bg-brand-950" : "border-slate-200 dark:border-slate-700")}>
              <span className="block text-xl font-black">{m}</span>
              <span className="block text-[10px] font-extrabold uppercase text-slate-400">min</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-black">📖 Learning</h2>
        <Toggle label="Show reading aids" desc="Romaji for Japanese, romanization for Korean" on={showReadingAid} onFlip={() => savePrefs({ showReadingAid: !showReadingAid })} />
        <Toggle label="Sound effects" desc="Celebrations, clicks and feedback sounds" on={soundEnabled} onFlip={() => savePrefs({ soundEnabled: !soundEnabled })} />
      </Card>

      <Card>
        <h2 className="font-black">❤️ Hearts</h2>
        <p className="mt-1 text-sm font-bold text-slate-500">
          {stats.hearts}/{HEARTS_MAX} hearts · refill over time, via Practice, or instantly for {GEM_REFILL_COST} 💎 (you have {stats.gems}).
        </p>
        <Button className="mt-3" variant="sun" size="sm" onClick={refill} disabled={stats.hearts >= HEARTS_MAX}>
          Refill hearts · {GEM_REFILL_COST} 💎
        </Button>
      </Card>

      <Card>
        <h2 className="font-black">👋 Account</h2>
        <div className="mt-3"><SignOutButton /></div>
      </Card>
    </div>
  );
}

function Toggle({ label, desc, on, onFlip }: { label: string; desc: string; on: boolean; onFlip: () => void }) {
  return (
    <button onClick={onFlip} role="switch" aria-checked={on} className="mt-3 flex w-full items-center gap-3 rounded-2xl border-2 border-slate-200 p-3 text-left dark:border-slate-700">
      <span className="flex-1">
        <span className="block text-sm font-extrabold">{label}</span>
        <span className="block text-xs font-bold text-slate-400">{desc}</span>
      </span>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition", on ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-600")}>
        <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-6" : "left-1")} />
      </span>
    </button>
  );
}
