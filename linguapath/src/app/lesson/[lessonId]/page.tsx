// Lesson session: load → run → complete.
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { ExerciseDTO } from "@/lib/content";
import { LessonRunner, type LessonResult } from "@/components/lesson-engine";
import { LessonComplete, type AchievementDTO } from "@/components/lesson-complete";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { useAppStore } from "@/lib/store";

type Loaded = {
  lesson: { id: string; title: string; skill: string; xpReward: number };
  language: { name: string };
  hearts: number;
  exercises: ExerciseDTO[];
};

type Done = { xp: number; accuracy: number; streak: number; streakIncreased: boolean; gemsEarned: number; achievements: AchievementDTO[]; completedUnit: boolean };

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const showReadingAid = useAppStore((s) => s.showReadingAid);
  const refreshMe = useAppStore((s) => s.refreshMe);
  const pushToast = useAppStore((s) => s.pushToast);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<{ title: string; body: string; noHearts?: boolean } | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/lesson/${lessonId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "no-hearts") {
          setError({ title: "Out of hearts! 💔", body: data.message, noHearts: true });
        } else {
          setError({ title: "Can't start this lesson", body: data.error || "Something went wrong." });
        }
        return;
      }
      setLoaded(data);
    } catch {
      setError({ title: "Couldn't load the lesson", body: "Check your connection and retry." });
    }
  }, [lessonId]);

  useEffect(() => { void load(); }, [load]);

  async function handleFinish(r: LessonResult) {
    if (r.failed) { router.push("/learn"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/complete-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, accuracy: r.accuracy, mistakeIds: r.mistakeIds, heartsLost: r.heartsLost }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone({ xp: data.xp + (data.achievements?.reduce((n: number, a: AchievementDTO) => n + a.xpBonus, 0) ?? 0), accuracy: r.accuracy, streak: data.streak, streakIncreased: data.streakIncreased, gemsEarned: data.gemsEarned, achievements: data.achievements ?? [], completedUnit: data.completedUnit });
      void refreshMe();
    } catch {
      pushToast({ title: "Couldn't save progress", body: "Your result wasn't recorded — sorry!", icon: "😢" });
      router.push("/learn");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <LessonComplete mode="lesson" xp={done.xp} accuracy={done.accuracy} streak={done.streak}
        streakIncreased={done.streakIncreased} gemsEarned={done.gemsEarned} achievements={done.achievements}
        primaryHref="/learn" primaryLabel="Continue"
        extra={done.completedUnit ? (
          <div className="mt-4 w-full rounded-3xl border-2 border-sun-300 bg-sun-300/20 p-4 font-extrabold text-amber-600">
            🎓 UNIT COMPLETE! A brand-new unit just unlocked on your path.
          </div>
        ) : undefined} />
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <EmptyState icon={error.noHearts ? "💔" : "😕"} title={error.title} body={error.body}
          action={
            <div className="flex flex-col gap-2">
              {error.noHearts && (
                <Link href="/practice"><Button variant="sun">💪 Practice to earn a heart</Button></Link>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setError(null); void load(); }}>Retry</Button>
                <Link href="/learn"><Button variant="ghost">Back to path</Button></Link>
              </div>
            </div>
          } />
      </div>
    );
  }

  if (!loaded || saving) {
    return (
      <div className="py-16">
        <Spinner />
        {saving && <p className="text-center font-extrabold text-slate-400">Saving your victory…</p>}
      </div>
    );
  }

  return (
    <LessonRunner exercises={loaded.exercises} title={loaded.lesson.skill} subtitle={loaded.lesson.title}
      hearts={loaded.hearts} showAid={showReadingAid} onFinish={handleFinish} />
  );
}
