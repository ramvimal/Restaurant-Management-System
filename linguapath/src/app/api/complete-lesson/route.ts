import { NextResponse } from "next/server";
import { z } from "zod";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exercise, lesson, mistake, streak, user, userCourse, userProgress, xpLog } from "@/lib/schema";
import { getActiveUser } from "@/lib/session";
import { awardAchievements, computeHearts, HEARTS_MAX, nextStreakCount, todayStr, xpForLesson } from "@/lib/game";

const schema = z.object({
  lessonId: z.string(),
  accuracy: z.number().min(0).max(100),
  mistakeIds: z.array(z.string()).default([]),
  heartsLost: z.number().min(0).max(10).default(0),
});

const REVIEW_DAYS = [1, 3, 7, 14];

export async function POST(req: Request) {
  const current = await getActiveUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { lessonId, accuracy, mistakeIds, heartsLost } = schema.parse(await req.json());
    const lessonRow = await db.query.lesson.findFirst({ where: eq(lesson.id, lessonId), with: { unit: true } });
    if (!lessonRow || lessonRow.isPlaceholder) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

    const existing = await db.query.userProgress.findFirst({
      where: and(eq(userProgress.userId, current.id), eq(userProgress.lessonId, lessonId)),
    });
    const firstTime = !existing?.completed;
    const xp = firstTime ? xpForLesson(accuracy) : 5;
    const gemsEarned = 5 + (accuracy >= 100 ? 5 : 0);

    // Hearts
    const { hearts: currentHearts } = computeHearts(current.hearts, current.heartsUpdatedAt);
    const newHearts = Math.max(0, currentHearts - heartsLost);
    await db.update(user).set({
      hearts: newHearts,
      ...(currentHearts >= HEARTS_MAX && heartsLost > 0 ? { heartsUpdatedAt: new Date() } : {}),
      xpTotal: sql`${user.xpTotal} + ${xp}`,
      weeklyXp: sql`${user.weeklyXp} + ${xp}`,
      gems: sql`${user.gems} + ${gemsEarned}`,
    }).where(eq(user.id, current.id));

    // Progress (keep best)
    if (existing) {
      await db.update(userProgress).set({
        completed: true, completedAt: new Date(), attempts: sql`${userProgress.attempts} + 1`,
        accuracy: Math.max(existing.accuracy, accuracy), xpEarned: Math.max(existing.xpEarned, xp),
      }).where(eq(userProgress.id, existing.id));
    } else {
      await db.insert(userProgress).values({ userId: current.id, lessonId, completed: true, completedAt: new Date(), attempts: 1, accuracy, xpEarned: xp });
    }
    await db.insert(xpLog).values({ userId: current.id, languageId: lessonRow.unit.languageId, amount: xp, source: "lesson" });

    // Spaced-repetition mistakes
    for (const exerciseId of mistakeIds) {
      const ex = await db.query.exercise.findFirst({ where: eq(exercise.id, exerciseId), columns: { id: true, lessonId: true } });
      if (!ex || ex.lessonId !== lessonId) continue;
      const m = await db.query.mistake.findFirst({
        where: and(eq(mistake.userId, current.id), eq(mistake.exerciseId, exerciseId)),
      });
      const times = (m?.timesMissed ?? 0) + 1;
      const days = REVIEW_DAYS[Math.min(times - 1, REVIEW_DAYS.length - 1)];
      if (m) {
        await db.update(mistake).set({ timesMissed: times, resolved: false, nextReview: new Date(Date.now() + days * 86400000) }).where(eq(mistake.id, m.id));
      } else {
        await db.insert(mistake).values({ userId: current.id, exerciseId, languageId: lessonRow.unit.languageId, timesMissed: 1, nextReview: new Date(Date.now() + 86400000) });
      }
    }

    // Streak
    const prev = await db.query.streak.findFirst({ where: eq(streak.userId, current.id) });
    const today = todayStr();
    const streakIncreased = prev?.lastActiveDate !== today;
    const streakCount = nextStreakCount(prev?.lastActiveDate ?? "", prev?.count ?? 0, today);
    if (prev) {
      await db.update(streak).set({ count: streakCount, longest: Math.max(prev.longest, streakCount), lastActiveDate: today }).where(eq(streak.id, prev.id));
    } else {
      await db.insert(streak).values({ userId: current.id, count: 1, longest: 1, lastActiveDate: today });
    }

    // Unit completion + course advance
    const unitLessons = await db.query.lesson.findMany({
      where: and(eq(lesson.unitId, lessonRow.unitId), eq(lesson.isPlaceholder, false)),
      columns: { id: true },
    });
    let completedUnit = false;
    if (unitLessons.length > 0) {
      const unitDone = await db.query.userProgress.findMany({
        where: and(eq(userProgress.userId, current.id), inArray(userProgress.lessonId, unitLessons.map((l) => l.id)), eq(userProgress.completed, true)),
        columns: { id: true },
      });
      completedUnit = unitDone.length >= unitLessons.length;
    }
    const course = await db.query.userCourse.findFirst({
      where: and(eq(userCourse.userId, current.id), eq(userCourse.languageId, lessonRow.unit.languageId)),
    });
    if (course && completedUnit) {
      await db.update(userCourse).set({ currentUnit: Math.max(course.currentUnit, lessonRow.unit.number + 1) }).where(eq(userCourse.id, course.id));
    }
    const courseCountRows = await db.select({ c: count() }).from(userCourse).where(eq(userCourse.userId, current.id));
    const fresh = await db.query.user.findFirst({ where: eq(user.id, current.id) });

    const achievements = await awardAchievements(db, current.id, {
      accuracyPct: accuracy, completedUnit, courseCount: courseCountRows[0]?.c ?? 0, xpTotal: fresh!.xpTotal, streak: streakCount,
    });

    return NextResponse.json({
      xp, gemsEarned, hearts: newHearts, streak: streakCount, streakIncreased,
      completedUnit, achievements, firstTime,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    return NextResponse.json({ error: "Couldn't save your progress." }, { status: 500 });
  }
}
