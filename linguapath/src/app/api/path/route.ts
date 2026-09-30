import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { language, lesson, unit, user, userProgress } from "@/lib/schema";
import { getSessionUserId } from "@/lib/session";
import type { LessonState, PathDTO } from "@/lib/content";

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const found = await db.query.user.findFirst({ where: eq(user.id, userId), with: { courses: true } });
  if (!found) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course =
    found.courses.find((c) => c.languageId === url.searchParams.get("languageId")) ??
    found.courses.find((c) => c.id === found.activeCourseId) ??
    found.courses[0];
  if (!course) return NextResponse.json({ error: "no-course", message: "Pick a language first." }, { status: 404 });
  if (found.activeCourseId !== course.id) {
    await db.update(user).set({ activeCourseId: course.id }).where(eq(user.id, userId));
  }

  const lang = await db.query.language.findFirst({ where: eq(language.id, course.languageId) });
  const units = await db.query.unit.findMany({
    where: eq(unit.languageId, course.languageId),
    orderBy: asc(unit.number),
    with: { lessons: { orderBy: asc(lesson.number) } },
  });
  const progress = await db.query.userProgress.findMany({ where: eq(userProgress.userId, userId) });
  const done = new Map(progress.filter((p) => p.completed).map((p) => [p.lessonId, p]));

  // Flatten path order; first incomplete (after placed unit) is active.
  const flat = units.flatMap((u) => u.lessons.map((l) => ({ u, l })));
  let foundActive = false;
  const lessonStates = new Map<string, { state: LessonState; accuracy: number | null }>();
  for (const { u, l } of flat) {
    const skipped = u.number < course.placedUnit; // placement unlock
    const p = done.get(l.id);
    if (l.isPlaceholder || u.isPlaceholder) {
      lessonStates.set(l.id, { state: "locked", accuracy: null });
      continue;
    }
    if (p || skipped) {
      lessonStates.set(l.id, { state: "completed", accuracy: p?.accuracy ?? null });
      continue;
    }
    if (!foundActive) {
      foundActive = true;
      lessonStates.set(l.id, { state: "active", accuracy: null });
    } else {
      lessonStates.set(l.id, { state: "locked", accuracy: null });
    }
  }

  const dto: PathDTO = {
    language: {
      id: lang!.id, name: lang!.name, nativeName: lang!.nativeName,
      flag: lang!.flag, ttsLocale: lang!.ttsLocale,
      readingAidLabel: lang!.readingAidLabel, script: lang!.script,
    },
    course: { dailyGoalMin: course.dailyGoalMin, dailyXpGoal: course.dailyXpGoal, placedUnit: course.placedUnit, currentUnit: course.currentUnit },
    units: units.map((u) => ({
      id: u.id, number: u.number, title: u.title, description: u.description,
      cefr: u.cefr, color: u.color, isPlaceholder: u.isPlaceholder,
      locked: u.isPlaceholder || u.lessons.every((l) => lessonStates.get(l.id)?.state === "locked"),
      lessons: u.lessons.map((l) => ({
        id: l.id, number: l.number, title: l.title, skill: l.skill,
        xpReward: l.xpReward, isPlaceholder: l.isPlaceholder,
        state: lessonStates.get(l.id)!.state, accuracy: lessonStates.get(l.id)!.accuracy,
      })),
    })),
    progress: {
      completedLessons: Array.from(lessonStates.values()).filter((s) => s.state === "completed").length,
      totalLessons: flat.filter(({ u, l }) => !u.isPlaceholder && !l.isPlaceholder).length,
    },
  };
  return NextResponse.json(dto);
}
