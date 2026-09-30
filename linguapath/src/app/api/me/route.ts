import { NextResponse } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { streak, userCourse, xpLog } from "@/lib/schema";
import { getActiveUser } from "@/lib/session";
import { computeHearts, HEARTS_MAX } from "@/lib/game";

export async function GET() {
  const current = await getActiveUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [streakRow, courses] = await Promise.all([
    db.query.streak.findFirst({ where: eq(streak.userId, current.id) }),
    db.query.userCourse.findMany({ where: eq(userCourse.userId, current.id) }),
  ]);
  const course = courses.find((c) => c.id === current.activeCourseId) ?? courses[0] ?? null;

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const sums = await db
    .select({ total: sql<number | null>`sum(${xpLog.amount})` })
    .from(xpLog)
    .where(and(eq(xpLog.userId, current.id), gte(xpLog.createdAt, startOfDay)));

  const { hearts, nextRefillAt } = computeHearts(current.hearts, current.heartsUpdatedAt);

  return NextResponse.json({
    user: { id: current.id, name: current.name, email: current.email, image: current.image, createdAt: current.createdAt },
    stats: {
      xpTotal: current.xpTotal,
      weeklyXp: current.weeklyXp,
      hearts,
      heartsMax: HEARTS_MAX,
      nextRefillAt,
      gems: current.gems,
      streak: streakRow?.count ?? 0,
      goalXp: course?.dailyXpGoal ?? 20,
      goalProgress: sums[0]?.total ?? 0,
      activeLanguageId: course?.languageId ?? null,
      courseCount: courses.length,
    },
    prefs: { showReadingAid: current.showReadingAid, soundEnabled: current.soundEnabled },
  });
}
