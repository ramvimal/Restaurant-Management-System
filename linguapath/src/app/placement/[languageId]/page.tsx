// Placement test: 10 questions → placed into Unit 1/2/3.
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ExerciseDTO } from "@/lib/content";
import { LessonRunner, type LessonResult } from "@/components/lesson-engine";
import { LessonComplete } from "@/components/lesson-complete";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { useAppStore } from "@/lib/store";

type Loaded = {
  language: { id: string; name: string; flag: string; readingAidLabel: string };
  exercises: ExerciseDTO[];
};

export default function PlacementPage() {
  const { languageId } = useParams<{ languageId: string }>();
  const router = useRouter();
  const showReadingAid = useAppStore((s) => s.showReadingAid);
  const refreshMe = useAppStore((s) => s.refreshMe);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{ unit: number; accuracy: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/placement?languageId=${languageId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLoaded(data);
    } catch {
      setError("Couldn't load the placement test.");
    }
  }, [languageId]);

  useEffect(() => { void load(); }, [load]);

  async function handleFinish(r: LessonResult) {
    if (r.failed) { router.push("/learn"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageId, correct: r.correctFirst, total: r.total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setPlaced({ unit: data.placedUnit, accuracy: r.accuracy });
      void refreshMe();
    } catch {
      setError("Couldn't save your result — starting from scratch instead is fine!");
    } finally {
      setSaving(false);
    }
  }

  if (placed) {
    return (
      <LessonComplete mode="placement" xp={5} accuracy={placed.accuracy}
        headline={`You placed into Unit ${placed.unit}! 🎯`}
        subline={placed.unit >= 3 ? "Impressive — you're past the basics already!" : placed.unit === 2 ? "Nice! You've got the fundamentals down." : "A fresh start — you'll fly through the basics!"}
        primaryHref="/learn" primaryLabel="Start learning"
        extra={
          <div className="mt-4 w-full rounded-3xl border-2 border-brand-200 bg-brand-50 p-4 font-bold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
            Units before {placed.unit} are marked complete — replay them any time for easy XP.
          </div>
        } />
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <EmptyState icon="😕" title="Placement unavailable" body={error}
          action={<div className="flex gap-2"><Button onClick={() => { setError(""); void load(); }}>Retry</Button><Button variant="ghost" onClick={() => router.push("/learn")}>Skip test</Button></div>} />
      </div>
    );
  }
  if (!loaded || saving) return <div className="py-16"><Spinner /></div>;
  return (
    <LessonRunner exercises={loaded.exercises} title={`Level check · ${loaded.language.flag} ${loaded.language.name}`}
      hearts={null} showAid={showReadingAid} onFinish={handleFinish} />
  );
}
