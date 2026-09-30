// Public landing page.
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui";
import { Logo } from "@/components/nav";
import { LandingHero } from "@/components/landing-hero";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/learn");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <LandingHero />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-16 md:grid-cols-4" aria-label="Features">
        {[
          { icon: "🎮", title: "Game-like lessons", body: "Bite-size exercises with XP, hearts and streaks that keep you coming back." },
          { icon: "🗣️", title: "Real speaking", body: "Pronunciation with native-quality TTS, listening drills and voice practice." },
          { icon: "🧠", title: "Smart review", body: "Spaced-repetition Practice mode targets exactly what you get wrong." },
          { icon: "🏆", title: "Weekly leagues", body: "Climb the leaderboard with learners around the world every week." },
        ].map((f) => (
          <div key={f.title} className="rounded-3xl border-2 border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-2 font-extrabold text-slate-800 dark:text-slate-100">{f.title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t-2 border-slate-200 py-6 text-center text-sm font-bold text-slate-400 dark:border-slate-800">
        LinguaPath · Learn German, Dutch, Spanish, Korean & Japanese · Made with 💚
      </footer>
    </div>
  );
}
