import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { language, user, userCourse } from "@/lib/schema";
import { getSessionUserId } from "@/lib/session";

const schema = z.object({ languageId: z.string().min(2).max(8) });

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { languageId } = schema.parse(await req.json());
    const lang = await db.query.language.findFirst({ where: eq(language.id, languageId) });
    if (!lang) return NextResponse.json({ error: "Unknown language." }, { status: 404 });
    const existing = await db.query.userCourse.findFirst({
      where: and(eq(userCourse.userId, userId), eq(userCourse.languageId, languageId)),
    });
    let courseId = existing?.id;
    if (!existing) {
      courseId = randomUUID();
      await db.insert(userCourse).values({ id: courseId, userId, languageId, dailyGoalMin: 10, dailyXpGoal: 20 });
    }
    await db.update(user).set({ activeCourseId: courseId }).where(eq(user.id, userId));
    return NextResponse.json({ courseId, isNew: !existing });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    return NextResponse.json({ error: "Couldn't enroll. Try again." }, { status: 500 });
  }
}
