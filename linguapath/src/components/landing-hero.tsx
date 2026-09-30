// Animated landing hero (client component).
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mascot } from "./mascot";
import { Button } from "./ui";

const LANGS = [
  { flag: "🇩🇪", name: "German", learners: "2.4M learners" },
  { flag: "🇳🇱", name: "Dutch", learners: "812K learners" },
  { flag: "🇪🇸", name: "Spanish", learners: "8.1M learners" },
  { flag: "🇰🇷", name: "Korean", learners: "2.9M learners" },
  { flag: "🇯🇵", name: "Japanese", learners: "3.7M learners" },
];

export function LandingHero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
      <div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            ✨ The fun way to learn a language
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-4 text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          Small steps.
          <br />
          <span className="text-brand-500">Big fluency.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-4 max-w-md text-lg font-semibold text-slate-500 dark:text-slate-400">
          Join Pip on a playful path from your first “hello” to real conversations — 10 minutes a day is all it takes.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }} className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup"><Button size="lg">Get started — it&apos;s free</Button></Link>
          <Link href="/login"><Button size="lg" variant="outline">I already have an account</Button></Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex items-center gap-4 text-sm font-bold text-slate-400">
          <span>⭐ 4.9 learner rating</span>
          <span>·</span>
          <span>🔥 1M+ day streaks kept</span>
        </motion.div>
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-[2.5rem] border-2 border-slate-200 bg-gradient-to-b from-brand-50 to-sun-300/30 p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center justify-center gap-4">
            <Mascot size={130} />
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-3 text-sm font-bold text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
              Hallo! Hola! <br /> 안녕! こんにちは！
              <br />
              <span className="text-brand-600 dark:text-brand-400">Pick a language 👇</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {LANGS.map((l, i) => (
              <motion.div key={l.name} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                <Link href="/signup" className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-3 transition hover:border-brand-400 hover:shadow-pop dark:border-slate-600 dark:bg-slate-900">
                  <span className="text-3xl">{l.flag}</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-200">{l.name}</span>
                  <span className="ml-auto text-xs font-bold text-slate-400">{l.learners}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
