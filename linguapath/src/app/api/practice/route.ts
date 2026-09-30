import { NextResponse } from "next/server";
import { and, asc, eq, inArray, lte, not } from "drizzle-orm";
import { db } from "@/lib/db";
import { exercise, lesson, mistake, unit, user, userProgress, type ExerciseRow } from "@/lib/schema";
import { getSessionUserId } from "@/lib/session";
import { parseJsonArray, type ExerciseDTO } from "@/lib/content";

function toDTO(e: ExerciseRow, ttsLocale: string): ExerciseDTO {
  return {
    id: e.id, order: e.order, type: e.type, prompt: e.prompt, question: e.question,
    questionLang: e.questionLang, answer: e.answer,
    options: parseJsonArray(e.options), wordBank: parseJsonArray(e.wordBank),
    pairs: parseJsonArray(e.pairs), audioText: e.audioText, readingAid: e.readingAid,
    image: e.image, explanation: e.explanation, hint: e.hint, ttsLocale,
  };
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const found = await db.query.user.findFirst({ where: eq(user.id, userId), with: { courses: { with: { language: true } } } });
  const course = found?.courses.find((c) => c.id === found.activeCourseId) ?? found?.courses[0];
  if (!course) return NextResponse.json({ error: "no-course" }, { status: 404 });

  const due = await db.query.mistake.findMany({
    where: and(
      eq(mistake.userId, userId),
      eq(mistake.languageId, course.languageId),
      eq(mistake.resolved, false),
      lte(mistake.nextReview, new Date())
    ),
    with: { exercise: true },
    orderBy: asc(mistake.updatedAt),
    limit: 10,
  });

  let exercises = due.map((m) => toDTO(m.exercise, course.language.ttsLocale));

  // Top up with random exercises from completed lessons so practice is always 10.
  if (exercises.length < 10) {
    const completed = await db.query.userProgress.findMany({
      where: and(eq(userProgress.userId, userId), eq(userProgress.completed, true)),
      columns: { lessonId: true },
    });
    if (completed.length > 0) {
      const picked = exercises.map((e) => e.id);
      const filters = [
        inArray(exercise.lessonId, completed.map((c) => c.lessonId)),
        eq(unit.languageId, course.languageId),
        ...(picked.length > 0 ? [not(inArray(exercise.id, picked))] : []),
      ];
      const extra = await db
        .select({ exercise })
        .from(exercise)
        .innerJoin(lesson, eq(exercise.lessonId, lesson.id))
        .innerJoin(unit, eq(lesson.unitId, unit.id))
        .where(and(...filters))
        .limit(30);
      const shuffled = extra.sort(() => Math.random() - 0.5).slice(0, 10 - exercises.length);
      exercises = [...exercises, ...shuffled.map((e) => toDTO(e.exercise, course.language.ttsLocale))];
    }
  }

  if (exercises.length === 0) {
    return NextResponse.json({ exercises: [], reason: "fresh", language: { name: course.language.name } });
  }
  return NextResponse.json({
    exercises,
    reviewCount: due.length,
    language: { id: course.language.id, name: course.language.name, ttsLocale: course.language.ttsLocale, readingAidLabel: course.language.readingAidLabel },
  });
}
