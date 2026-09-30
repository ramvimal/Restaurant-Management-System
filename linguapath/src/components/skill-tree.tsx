// The Duolingo-style zig-zag learning path.
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Lock, Star, BookOpen, Play } from "lucide-react";
import type { LessonDTO, PathDTO } from "@/lib/content";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const UNIT_COLORS: Record<string, { banner: string; node: string; ring: string }> = {
  brand: { banner: "bg-brand-500", node: "bg-brand-500 shadow-brand-700", ring: "ring-brand-200" },
  grape: { banner: "bg-grape-500", node: "bg-grape-500 shadow-violet-800", ring: "ring-violet-200" },
  sun: { banner: "bg-sun-400", node: "bg-sun-400 shadow-amber-600", ring: "ring-amber-200" },
  coral: { banner: "bg-coral-500", node: "bg-coral-500 shadow-rose-800", ring: "ring-rose-200" },
};

const OFFSETS = [0, -48, -84, -48, 0, 48, 84, 48];

function LessonNode({ lesson, offset, index }: { lesson: LessonDTO; offset: number; index: number }) {
  const router = useRouter();
  const pushToast = useAppStore((s) => s.pushToast);
  const { state } = lesson;

  function onClick() {
    if (state === "locked") {
      pushToast({ title: "Locked 🔒", body: "Finish the earlier lessons to unlock this one.", icon: "🔒" });
      return;
    }
    router.push(`/lesson/${lesson.id}`);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }} style={{ x: offset }} className="relative flex justify-center">
      {state === "active" && (
        <div className="absolute -top-12 z-10 animate-node-bounce whitespace-nowrap rounded-2xl border-2 border-slate-200 bg-white px-4 py-1.5 text-sm font-black uppercase tracking-wide text-slate-700 shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
          Start
          <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800" />
        </div>
      )}
      <button onClick={onClick} disabled={state === "locked" && false} aria-label={`${lesson.title} — ${lesson.skill} — ${state}`}
        className={cn("node-btn relative grid h-[72px] w-[72px] place-items-center rounded-full border-b-8",
          state === "completed" && "border-amber-600 bg-sun-400 text-amber-950",
          state === "active" && "animate-node-bounce border-brand-700 bg-brand-500 text-white ring-4 ring-brand-200 dark:ring-brand-900",
          state === "locked" && "border-slate-300 bg-slate-200 text-slate-400 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-500")}>
        {state === "completed" ? <Check className="h-8 w-8" strokeWidth={3.5} />
          : state === "active" ? <Star className="h-8 w-8 fill-white" />
            : lesson.isPlaceholder ? <BookOpen className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
      </button>
      <span className="sr-only">{lesson.skill}</span>
    </motion.div>
  );
}

export function SkillTree({ path }: { path: PathDTO }) {
  const c = UNIT_COLORS[path.units[0]?.color] ?? UNIT_COLORS.brand;
  void c;
  return (
    <div className="flex flex-col gap-10 pb-24">
      {path.units.map((unit) => {
        const theme = UNIT_COLORS[unit.color] ?? UNIT_COLORS.brand;
        const doneCount = unit.lessons.filter((l) => l.state === "completed").length;
        return (
          <section key={unit.id} aria-label={unit.title}>
            <div className={cn("overflow-hidden rounded-3xl text-white shadow-chunky", unit.isPlaceholder ? "bg-slate-400 dark:bg-slate-600" : theme.banner)}>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest opacity-80">{unit.cefr} · Unit {unit.number}</p>
                  <h2 className="text-lg font-black leading-tight">{unit.title.replace(/^Unit \d+: /, "")}</h2>
                  <p className="text-sm font-semibold opacity-90">{unit.isPlaceholder ? "🔒 Coming soon — keep learning to unlock!" : unit.description}</p>
                </div>
                {!unit.isPlaceholder && (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-xl font-black">
                    {doneCount}/{unit.lessons.length}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col items-center gap-5">
              {unit.lessons.map((lesson, i) => (
                <div key={lesson.id} className="flex flex-col items-center gap-1">
                  <LessonNode lesson={lesson} offset={unit.isPlaceholder ? 0 : OFFSETS[i % OFFSETS.length]} index={i} />
                  <span className={cn("text-xs font-extrabold uppercase tracking-wide",
                    lesson.state === "locked" ? "text-slate-300 dark:text-slate-600" : "text-slate-400")}>
                    {lesson.skill || lesson.title}
                  </span>
                </div>
              ))}
              {!unit.isPlaceholder && doneCount === unit.lessons.length && (
                <div className="flex items-center gap-2 rounded-full bg-sun-300/40 px-4 py-1.5 text-sm font-black text-amber-600">
                  <Play className="h-4 w-4" /> Unit complete — replay any lesson!
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
