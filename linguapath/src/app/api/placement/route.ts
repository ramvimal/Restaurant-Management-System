import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exercise, language, lesson, unit, user, userCourse, xpLog } from "@/lib/schema";
import { getSessionUserId } from "@/lib/session";
import { parseJsonArray, type ExerciseDTO } from "@/lib/content";

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const languageId = new URL(req.url).searchParams.get("languageId");
  if (!languageId) return NextResponse.json({ error: "Missing languageId." }, { status: 400 });
  const lang = await db.query.language.findFirst({ where: eq(language.id, languageId) });
  if (!lang) return NextResponse.json({ error: "Unknown language." }, { status: 404 });

  // 10 questions ramping across units 1 → 3 (skip speaking for onboarding).
  const per: Record<number, number> = { 1: 4, 2: 3, 3: 3 };
  const picked: ExerciseDTO[] = [];
  for (const unitNo of [1, 2, 3]) {
    const rows = await db
      .select({ exercise })
      .from(exercise)
      .innerJoin(lesson, eq(exercise.lessonId, lesson.id))
      .innerJoin(unit, eq(lesson.unitId, unit.id))
      .where(and(
        eq(unit.languageId, languageId),
        eq(unit.number, unitNo),
        eq(lesson.number, 1),
        ne(exercise.type, "speaking")
      ))
      .orderBy(asc(exercise.order))
      .limit(10);
    const exs = rows.map((r) => r.exercise);
    const step = Math.max(1, Math.floor(exs.length / per[unitNo]));
    let unitCount = 0;
    for (let i = 0; i < exs.length && picked.length < 10; i += step) {
      if (unitCount >= per[unitNo]) break;
      const e = exs[i];
      if (picked.some((p) => p.id === e.id)) continue;
      unitCount++;
      picked.push({
        id: e.id, order: picked.length + 1, type: e.type, prompt: e.prompt, question: e.question,
        questionLang: e.questionLang, answer: e.answer,
        options: parseJsonArray(e.options), wordBank: parseJsonArray(e.wordBank),
        pairs: parseJsonArray(e.pairs), audioText: e.audioText, readingAid: e.readingAid,
        image: e.image, explanation: e.explanation, hint: e.hint, ttsLocale: lang.ttsLocale,
      });
    }
  }
  return NextResponse.json({
    language: { id: lang.id, name: lang.name, flag: lang.flag, ttsLocale: lang.ttsLocale, readingAidLabel: lang.readingAidLabel },
    exercises: picked.slice(0, 10),
  });
}

const submitSchema = z.object({ languageId: z.string(), correct: z.number().min(0), total: z.number().min(1) });

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { languageId, correct, total } = submitSchema.parse(await req.json());
    const pct = correct / total;
    const placedUnit = pct >= 0.8 ? 3 : pct >= 0.5 ? 2 : 1;
    const existing = await db.query.userCourse.findFirst({
      where: and(eq(userCourse.userId, userId), eq(userCourse.languageId, languageId)),
    });
    let courseId = existing?.id;
    if (existing) {
      await db.update(userCourse).set({ startLevel: "placed", placedUnit, currentUnit: placedUnit }).where(eq(userCourse.id, existing.id));
    } else {
      courseId = randomUUID();
      await db.insert(userCourse).values({ id: courseId, userId, languageId, startLevel: "placed", placedUnit, currentUnit: placedUnit });
    }
    await db.update(user).set({
      activeCourseId: courseId,
      xpTotal: sql`${user.xpTotal} + 5`,
      weeklyXp: sql`${user.weeklyXp} + 5`,
    }).where(eq(user.id, userId));
    await db.insert(xpLog).values({ userId, languageId, amount: 5, source: "placement" });
    return NextResponse.json({ placedUnit });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    return NextResponse.json({ error: "Couldn't save placement." }, { status: 500 });
  }
}
