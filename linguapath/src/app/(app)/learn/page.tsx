// Home = the learning path / skill tree.
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PathDTO } from "@/lib/content";
import { SkillTree } from "@/components/skill-tree";
import { Button, EmptyState, Progress, Spinner } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Course = { id: string; languageId: string; language: { flag: string; name: string } };

export default function LearnPage() {
  const router = useRouter();
  const refreshMe = useAppStore((s) => s.refreshMe);
  const [path, setPath] = useState<PathDTO | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const [switching, setSwitching] = useState(false);

  const load = useCallback(async (languageId?: string) => {
    setError("");
    try {
      const [p, l] = await Promise.all([
        fetch(`/api/path${languageId ? `?languageId=${languageId}` : ""}`, { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/languages", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (p.error === "no-course") { router.push("/languages"); return; }
      if (p.error) { setError(p.message || p.error); return; }
      setPath(p);
      setCourses(l.courses ?? []);
      void refreshMe();
    } catch {
      setError("Couldn't load your path. Check your connection.");
    }
  }, [router, refreshMe]);

  useEffect(() => { void load(); }, [load]);

  async function switchLang(languageId: string) {
    if (languageId === path?.language.id) return;
    setSwitching(true);
    await fetch("/api/switch-language", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ languageId }) });
    setPath(null);
    await load(languageId);
    setSwitching(false);
  }

  if (error) {
    return <EmptyState icon="😕" title="Couldn't load your path" body={error} action={<Button onClick={() => load()}>Try again</Button>} />;
  }
  if (!path) return <Spinner />;

  const pct = path.progress.totalLessons ? Math.round((path.progress.completedLessons / path.progress.totalLessons) * 100) : 0;

  return (
    <div>
      {/* course header */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {courses.map((c) => (
          <button key={c.id} onClick={() => switchLang(c.languageId)} disabled={switching}
            aria-pressed={c.languageId === path.language.id} title={c.language.name}
            className={cn("grid h-12 w-12 place-items-center rounded-2xl border-2 text-2xl transition",
              c.languageId === path.language.id ? "border-brand-400 bg-brand-50 dark:bg-brand-950" : "border-slate-200 opacity-60 hover:opacity-100 dark:border-slate-700")}>
            {c.language.flag}
          </button>
        ))}
        <Link href="/languages" className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-dashed border-slate-300 text-2xl text-slate-400 hover:border-brand-400 hover:text-brand-500" title="Add a language" aria-label="Add a language">
          +
        </Link>
        <div className="ml-1 min-w-0">
          <h1 className="truncate text-lg font-black text-slate-800 dark:text-slate-100">
            {path.language.flag} {path.language.name}
          </h1>
          <div className="flex items-center gap-2">
            <Progress value={pct} className="h-2.5 w-28" />
            <span className="text-xs font-extrabold text-slate-400">{path.progress.completedLessons}/{path.progress.totalLessons}</span>
          </div>
        </div>
        <Link href="/practice" className="ml-auto">
          <Button size="sm" variant="sun">💪 Practice</Button>
        </Link>
      </div>

      {path.course.placedUnit > 1 && (
        <div className="mb-4 rounded-2xl border-2 border-grape-400/40 bg-grape-500/10 p-3 text-sm font-bold text-grape-600 dark:text-grape-400">
          🎯 You placed into <b>Unit {path.course.placedUnit}</b> — earlier units are marked complete. Replay them any time!
        </div>
      )}

      <SkillTree path={path} />
    </div>
  );
}
