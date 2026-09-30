// Spaced-repetition practice: reviews mistakes, restores a heart.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ExerciseDTO } from "@/lib/content";
import { LessonRunner, type LessonResult } from "@/components/lesson-engine";
import { LessonComplete } from "@/components/lesson-complete";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { useAppStore } from "@/lib/store";

type Loaded = { exercises: ExerciseDTO[]; reviewCount: number; reason?: string; language: { name: string } };
type Done = { xp: number; accuracy: number; streak: number; hearts: number; heartRestored: boolean };

export default function PracticePage() {
  const showReadingAid = useAppStore((s) => s.showReadingAid);
  const refreshMe = useAppStore((s) => s.refreshMe);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/practice", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error === "no-course" ? "Pick a language first!" : data.error);
        setLoaded(data);
      })
      .catch((e) => setError(e.message || "Couldn't load practice."));
  }, []);

  async function handleFinish(r: LessonResult) {
    if (r.failed) { setLoaded(null); setError("Session ended."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/practice/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accuracy: r.accuracy, reviewedIds: r.reviewedIds, mistakeIds: r.mistakeIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone({ xp: data.xp, accuracy: r.accuracy, streak: data.streak, hearts: data.hearts, heartRestored: data.heartRestored });
      void refreshMe();
    } catch {
      setError("Couldn't save practice. Try again!");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <LessonComplete mode="practice" xp={done.xp} accuracy={done.accuracy} streak={done.streak}
        primaryHref="/learn" primaryLabel="Back to path"
        extra={done.heartRestored ? (
          <div className="mt-4 w-full rounded-3xl border-2 border-rose-200 bg-rose-50 p-4 font-extrabold text-rose-500 dark:border-rose-900 dark:bg-rose-950">
            ❤️ +1 heart restored! Now at {done.hearts}.
          </div>
        ) : undefined} />
    );
  }
  if (error) return <EmptyState icon="😕" title="Practice unavailable" body={error} action={<Link href="/learn"><Button>Back to path</Button></Link>} />;
  if (!loaded || saving) return <div className="py-10"><Spinner /></div>;
  if (loaded.exercises.length === 0) {
    return (
      <EmptyState icon="🌱" title="Nothing to review yet"
        body="Complete a lesson first — then Practice will target exactly what you got wrong."
        action={<Link href="/learn"><Button>Start learning</Button></Link>} />
    );
  }
  return (
    <div className="-mx-4 -my-6">
      <LessonRunner exercises={loaded.exercises} title={`Practice · ${loaded.language.name}`}
        subtitle={`${loaded.reviewCount} due for review`} hearts={null} showAid={showReadingAid} onFinish={handleFinish} />
    </div>
  );
}
