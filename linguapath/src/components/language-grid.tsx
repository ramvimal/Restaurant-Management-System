// Language cards with flag + learner count.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatLearners } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Lang = { id: string; name: string; nativeName: string; flag: string; learners: number; script: string };

export function LanguageGrid({ languages, enrolledIds }: { languages: Lang[]; enrolledIds: string[] }) {
  const router = useRouter();
  const pushToast = useAppStore((s) => s.pushToast);
  const [busy, setBusy] = useState<string | null>(null);

  async function pick(lang: Lang) {
    setBusy(lang.id);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageId: lang.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.isNew) {
        router.push(`/onboarding?language=${lang.id}`);
      } else {
        pushToast({ title: `Switched to ${lang.name}!`, body: "Welcome back.", icon: lang.flag });
        router.push("/learn");
      }
    } catch (e) {
      pushToast({ title: "Couldn't select language", body: e instanceof Error ? e.message : "", icon: "😕" });
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {languages.map((l, i) => {
        const enrolled = enrolledIds.includes(l.id);
        return (
          <motion.button key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => pick(l)} disabled={busy !== null}
            className={cn("group flex items-center gap-4 rounded-3xl border-2 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-pop disabled:opacity-60 dark:bg-slate-800",
              enrolled ? "border-brand-400" : "border-slate-200 dark:border-slate-700")}>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-100 text-4xl dark:bg-slate-700">
              {busy === l.id ? "⏳" : l.flag}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-100">
                {l.name}
                {enrolled && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-black uppercase text-brand-700">Learning</span>}
              </span>
              <span className="cjk block truncate text-sm font-bold text-slate-400">{l.nativeName} · {formatLearners(l.learners)} learners</span>
              <span className="mt-0.5 block text-xs font-extrabold text-brand-600 opacity-0 transition group-hover:opacity-100">
                {enrolled ? "Continue →" : "Start learning →"}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
