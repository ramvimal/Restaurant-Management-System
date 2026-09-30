// Profile: stats, weekly activity, achievements, languages.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { achievement, lesson, unit, user, userProgress, xpLog } from "@/lib/schema";
import { Badge, Card, Progress } from "@/components/ui";
import { SignOutButton } from "@/components/account-actions";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/login");

  const found = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      streak: true,
      courses: { with: { language: true } },
      achievements: { with: { achievement: true } },
    },
  });
  if (!found) redirect("/login");
  // newest badges first
  found.achievements.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());

  // Per-course progress
  const courseStats = await Promise.all(
    found.courses.map(async (c) => {
      const [totalRows, doneRows] = await Promise.all([
        db.select({ c: count() }).from(lesson)
          .innerJoin(unit, eq(lesson.unitId, unit.id))
          .where(and(eq(unit.languageId, c.languageId), eq(lesson.isPlaceholder, false), eq(unit.isPlaceholder, false))),
        db.select({ c: count() }).from(userProgress)
          .innerJoin(lesson, eq(userProgress.lessonId, lesson.id))
          .innerJoin(unit, eq(lesson.unitId, unit.id))
          .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true), eq(unit.languageId, c.languageId))),
      ]);
      return { course: c, total: totalRows[0]?.c ?? 0, done: doneRows[0]?.c ?? 0 };
    })
  );

  // Last 7 days XP
  const days: { label: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const next = new Date(d);
    next.setUTCDate(d.getUTCDate() + 1);
    const agg = await db.select({ total: sql<number | null>`sum(${xpLog.amount})` }).from(xpLog)
      .where(and(eq(xpLog.userId, userId), gte(xpLog.createdAt, d), lt(xpLog.createdAt, next)));
    days.push({ label: d.toLocaleDateString("en-US", { weekday: "narrow" }), xp: agg[0]?.total ?? 0 });
  }
  const maxDay = Math.max(10, ...days.map((d) => d.xp));

  const allAchievements = await db.query.achievement.findMany();
  const owned = new Set(found.achievements.map((a) => a.achievementId));

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-grape-500 text-2xl font-black text-white">
          {(found.name ?? found.email).slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black">{found.name ?? "Learner"}</h1>
          <p className="truncate text-sm font-bold text-slate-400">{found.email}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge>🔥 {found.streak?.count ?? 0} day streak</Badge>
            <Badge>⚡ {found.xpTotal} XP</Badge>
          </div>
        </div>
        <SignOutButton />
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "💎", v: found.gems, l: "Gems" },
          { icon: "🏆", v: found.achievements.length, l: "Badges" },
          { icon: "🌍", v: found.courses.length, l: "Languages" },
        ].map((s) => (
          <Card key={s.l} className="p-3 text-center">
            <div className="text-2xl">{s.icon}</div>
            <div className="text-xl font-black">{s.v}</div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{s.l}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-black">This week&apos;s XP</h2>
        <div className="mt-3 flex h-28 items-end justify-between gap-2" role="img" aria-label="XP earned each day this week">
          {days.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-black text-slate-400">{d.xp > 0 ? d.xp : ""}</span>
              <div className="w-full rounded-t-lg bg-brand-400" style={{ height: `${Math.max(6, (d.xp / maxDay) * 80)}px`, opacity: d.xp ? 1 : 0.25 }} />
              <span className="text-xs font-black text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-black">My languages</h2>
          <Link href="/languages" className="text-sm font-extrabold text-brand-600">+ Add</Link>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {courseStats.map(({ course, total, done }) => (
            <div key={course.id}>
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <span className="text-xl">{course.language.flag}</span> {course.language.name}
                <span className="ml-auto text-xs text-slate-400">{done}/{total} lessons · 🎯 {course.dailyGoalMin} min/day</span>
              </div>
              <Progress value={total ? (done / total) * 100 : 0} className="mt-1 h-2.5" />
            </div>
          ))}
          {courseStats.length === 0 && <p className="text-sm font-bold text-slate-400">No languages yet — <Link href="/languages" className="text-brand-600">pick one!</Link></p>}
        </div>
      </Card>

      <Card>
        <h2 className="font-black">Achievements</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {allAchievements.map((a) => {
            const has = owned.has(a.id);
            return (
              <div key={a.id} title={a.description} className={`flex flex-col items-center rounded-2xl border-2 p-3 text-center ${has ? "border-sun-300 bg-sun-300/20" : "border-slate-200 opacity-50 dark:border-slate-700"}`}>
                <span className="text-3xl" style={has ? {} : { filter: "grayscale(1)" }}>{a.icon}</span>
                <span className="mt-1 text-xs font-black">{a.title}</span>
                <span className="text-[10px] font-bold text-slate-400">+{a.xpBonus} XP</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
