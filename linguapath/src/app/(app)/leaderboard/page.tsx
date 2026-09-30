// Weekly league leaderboard.
"use client";

import { useEffect, useState } from "react";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

type Entry = { id: string; name: string | null; image: string | null; weeklyXp: number; isBot: boolean; isMe: boolean };

const LEAGUES = ["Amethyst League 💜", "Emerald League 💚", "Ruby League ❤️", "Sapphire League 💙", "Golden League 🏆"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [weekKey, setWeekKey] = useState("");
  const [myRank, setMyRank] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setEntries(data.entries);
        setWeekKey(data.weekKey);
        setMyRank(data.myRank);
      })
      .catch(() => setError("Couldn't load the league."));
  }, []);

  if (error) return <EmptyState icon="🏆" title="League unavailable" body={error} action={<Button onClick={() => location.reload()}>Retry</Button>} />;
  if (!entries) return <Spinner />;

  const leagueName = LEAGUES[(weekKey.split("W")[1] ? parseInt(weekKey.split("W")[1]) : 0) % LEAGUES.length];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div className="mb-4 rounded-3xl bg-gradient-to-r from-grape-500 to-brand-500 p-5 text-center text-white shadow-chunky">
        <h1 className="text-2xl font-black">{leagueName}</h1>
        <p className="text-sm font-bold opacity-90">Top 30 racers · resets weekly · {weekKey}</p>
        {myRank && <p className="mt-1 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-black">You&apos;re #{myRank} — keep climbing! 🚀</p>}
      </div>

      <div className="mb-4 grid grid-cols-3 items-end gap-2">
        {top3.map((e, i) => (
          <div key={e.id} className={cn("flex flex-col items-center rounded-3xl border-2 p-3 text-center",
            e.isMe ? "border-brand-400 bg-brand-50 dark:bg-brand-950" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
            i === 0 && "order-2 -translate-y-2 border-sun-300 bg-sun-300/20 py-5",
            i === 1 && "order-1", i === 2 && "order-3")}>
            <span className="text-3xl">{medals[i]}</span>
            <span className="mt-1 grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-lg font-black text-brand-700 dark:bg-brand-900 dark:text-brand-200">
              {(e.name ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="mt-1 max-w-full truncate text-sm font-extrabold">{e.isMe ? "You" : e.name}</span>
            <span className="text-xs font-bold text-slate-400">{e.weeklyXp} XP</span>
          </div>
        ))}
      </div>

      <ol className="flex flex-col gap-2">
        {rest.map((e, i) => (
          <li key={e.id} className={cn("flex items-center gap-3 rounded-2xl border-2 p-3",
            e.isMe ? "border-brand-400 bg-brand-50 dark:bg-brand-950" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800")}>
            <span className="w-7 text-center font-black text-slate-400">{i + 4}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-base font-black text-slate-600 dark:bg-slate-700 dark:text-slate-200">
              {(e.name ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="font-extrabold">{e.isMe ? "You" : e.name}</span>
            <span className="ml-auto text-sm font-black text-sun-500">{e.weeklyXp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
