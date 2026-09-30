// Onboarding: daily goal + starting level.
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mascot, MascotBubble } from "@/components/mascot";
import { Button, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const GOALS = [
  { min: 5, label: "Casual", desc: "A gentle warm-up" },
  { min: 10, label: "Regular", desc: "Steady progress ⭐", popular: true },
  { min: 15, label: "Serious", desc: "Fast learner mode" },
  { min: 20, label: "Intense", desc: "Future polyglot!" },
];

function Flow() {
  const router = useRouter();
  const language = useSearchParams().get("language") ?? "";
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(10);
  const [saving, setSaving] = useState(false);

  async function saveGoalAndNext() {
    setSaving(true);
    await fetch("/api/set-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyGoalMin: goal, languageId: language || undefined }),
    }).catch(() => {});
    setSaving(false);
    setStep(1);
  }

  function startFromScratch() {
    router.push("/learn");
  }

  function testLevel() {
    router.push(language ? `/placement/${language}` : "/languages");
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <div className="flex items-center gap-4">
        <Mascot size={90} mood={step === 0 ? "happy" : "thinking"} />
        <MascotBubble>
          {step === 0 ? "How much time can you give me each day? ⏰" : "Have you learned some before? Let's find your level! 🎯"}
        </MascotBubble>
      </div>

      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => (
              <button key={g.min} onClick={() => setGoal(g.min)} aria-pressed={goal === g.min}
                className={cn("relative rounded-3xl border-2 p-4 text-center transition",
                  goal === g.min ? "border-brand-400 bg-brand-50 dark:bg-brand-950" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800")}>
                {g.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">Most popular</span>}
                <span className="block text-3xl font-black text-slate-800 dark:text-slate-100">{g.min}<span className="text-sm font-bold text-slate-400"> min</span></span>
                <span className="block text-sm font-extrabold text-brand-600">{g.label}</span>
                <span className="block text-xs font-bold text-slate-400">{g.desc}</span>
              </button>
            ))}
          </div>
          <Button size="lg" className="mt-4 w-full" onClick={saveGoalAndNext} disabled={saving}>
            {saving ? "Saving…" : "Continue"}
          </Button>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-3">
          <button onClick={startFromScratch} className="rounded-3xl border-2 border-slate-200 bg-white p-5 text-left transition hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-3xl">🌱</span>
            <span className="block text-lg font-black">Start from scratch</span>
            <span className="block text-sm font-bold text-slate-400">Begin at Unit 1 with the very basics.</span>
          </button>
          <button onClick={testLevel} className="rounded-3xl border-2 border-slate-200 bg-white p-5 text-left transition hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-3xl">🎯</span>
            <span className="block text-lg font-black">Test my level <span className="text-xs font-black uppercase text-brand-600">(2 min)</span></span>
            <span className="block text-sm font-bold text-slate-400">Answer 10 quick questions to skip what you know.</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Flow />
    </Suspense>
  );
}
