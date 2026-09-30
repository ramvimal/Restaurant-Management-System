// Lesson runner: progress bar, hearts, check/continue bar with feedback.
// Used by lessons, practice mode and the placement test.
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, Check, Flag } from "lucide-react";
import type { ExerciseDTO } from "@/lib/content";
import { ExerciseView, gradeExercise, type ExState } from "./exercises";
import { Button, Progress } from "./ui";
import { useAppStore } from "@/lib/store";
import { sfx } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { GEM_REFILL_COST } from "@/lib/game-client";

export type LessonResult = {
  total: number;
  correctFirst: number;
  accuracy: number;
  mistakeIds: string[];
  reviewedIds: string[];
  heartsLost: number;
  failed: boolean;
};

type Props = {
  exercises: ExerciseDTO[];
  title: string;
  subtitle?: string;
  /** starting hearts, or null for no-hearts mode (practice/placement) */
  hearts: number | null;
  showAid: boolean;
  onFinish: (r: LessonResult) => void;
};

export function LessonRunner({ exercises, title, subtitle, hearts, showAid, onFinish }: Props) {
  const router = useRouter();
  const pushToast = useAppStore((s) => s.pushToast);
  const [idx, setIdx] = useState(0);
  const [exState, setExState] = useState<ExState>({ value: null, complete: false });
  const [phase, setPhase] = useState<"answer" | "feedback">("answer");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [heartsLeft, setHeartsLeft] = useState(hearts);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [refilling, setRefilling] = useState(false);

  const ex = exercises[idx];
  const startHearts = hearts ?? 0;
  const progress = useMemo(
    () => ((idx + (phase === "feedback" ? 1 : 0)) / exercises.length) * 100,
    [idx, phase, exercises.length]
  );

  if (!ex) return null;
  const isSpeaking = ex.type === "speaking";

  function check() {
    const ok = gradeExercise(ex, exState.value);
    setLastCorrect(ok);
    setPhase("feedback");
    if (ok) {
      sfx.correct();
      setCorrectCount((c) => c + 1);
      setReviewed((r) => [...r, ex.id]);
    } else {
      sfx.wrong();
      setMistakes((m) => [...m, ex.id]);
      if (heartsLeft !== null) setHeartsLeft(Math.max(0, heartsLeft - 1));
    }
  }

  function skipSpeaking() {
    // Skipping costs accuracy but never a heart.
    setLastCorrect(false);
    setPhase("feedback");
    sfx.wrong();
  }

  function cont() {
    if (heartsLeft !== null && heartsLeft <= 0) {
      setShowHeartsModal(true);
      return;
    }
    if (idx + 1 >= exercises.length) {
      finish(false);
    } else {
      setIdx(idx + 1);
      setExState({ value: null, complete: false });
      setPhase("answer");
    }
  }

  function finish(failed: boolean) {
    const total = exercises.length;
    const accuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    onFinish({
      total, correctFirst: correctCount, accuracy,
      mistakeIds: Array.from(new Set(mistakes)), reviewedIds: Array.from(new Set(reviewed)),
      heartsLost: hearts === null ? 0 : startHearts - (heartsLeft ?? 0),
      failed,
    });
  }

  async function refill() {
    setRefilling(true);
    try {
      const res = await fetch("/api/hearts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "refill" }) });
      const data = await res.json();
      if (!res.ok) {
        pushToast({ title: "Can't refill", body: data.error || "Not enough gems.", icon: "💎" });
        return;
      }
      setHeartsLeft(3);
      setShowHeartsModal(false);
      pushToast({ title: "Hearts refilled! ❤️", body: "Back in the game.", icon: "❤️" });
    } finally {
      setRefilling(false);
    }
  }

  function quit() {
    if (window.confirm("Quit this session? Your progress here won't be saved.")) router.back();
  }

  const correctAnswerText =
    ex.type === "word_bank" ? (() => { try { return (JSON.parse(ex.answer) as string[]).join(" "); } catch { return ex.answer; } })()
    : ex.type === "match" ? ex.pairs.map((p) => `${p[0]} = ${p[1]}`).join(" · ")
    : ex.answer;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-48 pt-4">
      {/* top bar */}
      <div className="flex items-center gap-3">
        <button onClick={quit} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Quit session">
          <X className="h-6 w-6" />
        </button>
        <Progress value={progress} className="flex-1" />
        {heartsLeft !== null && (
          <div className="flex items-center gap-1 font-extrabold text-rose-500" aria-label={`${heartsLeft} hearts left`}>
            <Heart className={cn("h-5 w-5", heartsLeft === 0 ? "text-slate-300" : "fill-rose-500 text-rose-500")} />
            {heartsLeft}
          </div>
        )}
      </div>
      <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">
        {title}{subtitle ? ` · ${subtitle}` : ""} · {idx + 1}/{exercises.length}
      </p>

      {/* exercise */}
      <div className="mt-4 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={ex.id + "-" + idx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }}>
            <fieldset disabled={phase === "feedback"} className={cn(phase === "feedback" && !lastCorrect && "animate-shake")}>
              <ExerciseView ex={ex} showAid={showAid} onState={setExState} />
            </fieldset>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* bottom bar */}
      <div className={cn("fixed inset-x-0 bottom-0 z-40 border-t-2 p-4",
        phase === "feedback" ? (lastCorrect ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950" : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950")
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900")}>
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {phase === "feedback" && (
            <div className="flex items-start gap-3">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-white", lastCorrect ? "bg-brand-500" : "bg-coral-500")}>
                {lastCorrect ? <Check className="h-6 w-6" /> : <Flag className="h-6 w-6" />}
              </span>
              <div className="min-w-0">
                <p className={cn("text-lg font-black", lastCorrect ? "text-brand-600 dark:text-brand-400" : "text-coral-500")}>
                  {lastCorrect ? ["Brilliant!", "Perfect!", "Nice work!", "Exactly right!"][idx % 4] : "Correct answer:"}
                </p>
                {!lastCorrect && <p className="cjk text-base font-extrabold text-slate-700 dark:text-slate-200">{correctAnswerText}</p>}
                {ex.explanation && <p className="mt-0.5 text-sm font-semibold text-slate-500 dark:text-slate-400">{ex.explanation}</p>}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            {phase === "answer" && isSpeaking && (
              <Button variant="ghost" onClick={skipSpeaking} className="flex-1">Skip</Button>
            )}
            {phase === "answer" ? (
              <Button onClick={check} disabled={!exState.complete} className="flex-1" size="lg">
                Check
              </Button>
            ) : (
              <Button onClick={cont} variant={lastCorrect ? "primary" : "danger"} className="flex-1" size="lg">
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* out of hearts modal */}
      <AnimatePresence>
        {showHeartsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Out of hearts">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm rounded-3xl bg-white p-6 text-center dark:bg-slate-800">
              <div className="text-6xl">💔</div>
              <h2 className="mt-2 text-2xl font-black">Out of hearts!</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">Refill to keep going, or end the session and practice instead.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Button onClick={refill} disabled={refilling}>Refill hearts · {GEM_REFILL_COST} 💎</Button>
                <Button variant="ghost" onClick={() => finish(true)}>End session</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
