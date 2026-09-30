import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { mistake, streak, user, userCourse, xpLog } from "@/lib/schema";
import { getActiveUser } from "@/lib/session";
import { computeHearts, HEARTS_MAX, nextStreakCount, todayStr } from "@/lib/game";

const schema = z.object({
  accuracy: z.number().min(0).max(100),
  reviewedIds: z.array(z.string()).default([]), // answered correctly → resolve
  mistakeIds: z.array(z.string()).default([]), // answered wrong → reschedule
});

export async function POST(req: Request) {
  const current = await getActiveUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { accuracy, reviewedIds, mistakeIds } = schema.parse(await req.json());
    const xp = 5 + Math.round((accuracy / 100) * 5);

    if (reviewedIds.length > 0) {
      await db.update(mistake).set({ resolved: true }).where(and(eq(mistake.userId, current.id), inArray(mistake.exerciseId, reviewedIds)));
    }
    for (const exerciseId of mistakeIds) {
      const m = await db.query.mistake.findFirst({
        where: and(eq(mistake.userId, current.id), eq(mistake.exerciseId, exerciseId)),
      });
      if (m) {
        await db.update(mistake).set({ timesMissed: m.timesMissed + 1, resolved: false, nextReview: new Date(Date.now() + 86400000) }).where(eq(mistake.id, m.id));
      }
    }

    // Practice restores 1 heart and extends the streak.
    const { hearts } = computeHearts(current.hearts, current.heartsUpdatedAt);
    const newHearts = Math.min(HEARTS_MAX, hearts + 1);
    await db.update(user).set({
      hearts: newHearts,
      xpTotal: sql`${user.xpTotal} + ${xp}`,
      weeklyXp: sql`${user.weeklyXp} + ${xp}`,
      gems: sql`${user.gems} + 2`,
    }).where(eq(user.id, current.id));

    const course = current.activeCourseId
      ? await db.query.userCourse.findFirst({ where: eq(userCourse.id, current.activeCourseId) })
      : null;
    await db.insert(xpLog).values({ userId: current.id, languageId: course?.languageId, amount: xp, source: "practice" });

    const prev = await db.query.streak.findFirst({ where: eq(streak.userId, current.id) });
    const today = todayStr();
    const streakCount = nextStreakCount(prev?.lastActiveDate ?? "", prev?.count ?? 0, today);
    if (prev) {
      await db.update(streak).set({ count: streakCount, longest: Math.max(prev.longest, streakCount), lastActiveDate: today }).where(eq(streak.id, prev.id));
    } else {
      await db.insert(streak).values({ userId: current.id, count: 1, longest: 1, lastActiveDate: today });
    }

    return NextResponse.json({ xp, hearts: newHearts, heartRestored: newHearts > hearts, streak: streakCount });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    return NextResponse.json({ error: "Couldn't save practice." }, { status: 500 });
  }
}
