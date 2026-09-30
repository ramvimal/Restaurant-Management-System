import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, userCourse } from "@/lib/schema";
import { getSessionUserId } from "@/lib/session";

const schema = z.object({
  dailyGoalMin: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
  languageId: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { dailyGoalMin, languageId } = schema.parse(await req.json());
    const found = await db.query.user.findFirst({ where: eq(user.id, userId), with: { courses: true } });
    if (!found) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const course = languageId
      ? found.courses.find((c) => c.languageId === languageId)
      : found.courses.find((c) => c.id === found.activeCourseId);
    if (!course) return NextResponse.json({ error: "Pick a language first." }, { status: 400 });
    await db.update(userCourse).set({ dailyGoalMin, dailyXpGoal: dailyGoalMin * 2 }).where(eq(userCourse.id, course.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid goal." }, { status: 400 });
    return NextResponse.json({ error: "Couldn't save your goal." }, { status: 500 });
  }
}
