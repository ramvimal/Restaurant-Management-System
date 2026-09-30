import { NextResponse } from "next/server";
import { and, asc, eq, inArray, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { exercise, lesson, unit, user, userProgress } from "@/lib/schema";
import { getSessionUserId } from "@/lib/session";
import { parseJsonArray, type ExerciseDTO } from "@/lib/content";
import { computeHearts } from "@/lib/game";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lessonRow = await db.query.lesson.findFirst({
    where: eq(lesson.id, params.id),
    with: { unit: { with: { language: true } }, exercises: { orderBy: asc(exercise.order) } },
  });
  if (!lessonRow || lessonRow.isPlaceholder || lessonRow.unit.isPlaceholder) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const found = await db.query.user.findFirst({ where: eq(user.id, userId), with: { courses: true } });
  const course = found?.courses.find((c) => c.languageId === lessonRow.unit.languageId);
  if (!course) return NextResponse.json({ error: "Enroll in this language first." }, { status: 403 });

  // Access check: lesson itself done, or every earlier lesson done (or skipped by placement).
  const earlier = await db
    .select({ id: lesson.id, unitNumber: unit.number })
    .from(lesson)
    .innerJoin(unit, eq(lesson.unitId, unit.id))
    .where(
      and(
        eq(unit.languageId, lessonRow.unit.languageId),
        eq(lesson.isPlaceholder, false),
        or(
          lt(unit.number, lessonRow.unit.number),
          and(eq(lesson.unitId, lessonRow.unitId), lt(lesson.number, lessonRow.number))
        )
      )
    );
  let doneIds = new Set<string>();
  if (earlier.length > 0) {
    const rows = await db.query.userProgress.findMany({
      where: and(
        eq(userProgress.userId, userId),
        inArray(userProgress.lessonId, earlier.map((l) => l.id)),
        eq(userProgress.completed, true)
      ),
      columns: { lessonId: true },
    });
    doneIds = new Set(rows.map((p) => p.lessonId));
  }
  const unlocked =
    lessonRow.unit.number <= course.placedUnit - 1
      ? true // within skipped range — replayable
      : earlier.every((l) => l.unitNumber < course.placedUnit || doneIds.has(l.id));
  if (!unlocked) return NextResponse.json({ error: "Finish earlier lessons to unlock this one." }, { status: 403 });

  const { hearts } = computeHearts(found!.hearts, found!.heartsUpdatedAt);
  if (hearts <= 0) return NextResponse.json({ error: "no-hearts", message: "You're out of hearts! Practice or wait for a refill." }, { status: 403 });

  const exercises: ExerciseDTO[] = lessonRow.exercises.map((e) => ({
    id: e.id, order: e.order, type: e.type, prompt: e.prompt, question: e.question,
    questionLang: e.questionLang, answer: e.answer,
    options: parseJsonArray(e.options), wordBank: parseJsonArray(e.wordBank),
    pairs: parseJsonArray<[string, string]>(e.pairs),
    audioText: e.audioText, readingAid: e.readingAid, image: e.image,
    explanation: e.explanation, hint: e.hint, ttsLocale: lessonRow.unit.language.ttsLocale,
  }));

  return NextResponse.json({
    lesson: { id: lessonRow.id, title: lessonRow.title, skill: lessonRow.unit.title, xpReward: lessonRow.xpReward },
    language: { id: lessonRow.unit.language.id, name: lessonRow.unit.language.name, ttsLocale: lessonRow.unit.language.ttsLocale, readingAidLabel: lessonRow.unit.language.readingAidLabel },
    hearts,
    exercises,
  });
}
