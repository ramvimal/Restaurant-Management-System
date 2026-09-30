import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, userCourse } from "@/lib/schema";
import { getSessionUserId } from "@/lib/session";

const schema = z.object({ languageId: z.string().min(2).max(8) });

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { languageId } = schema.parse(await req.json());
    const course = await db.query.userCourse.findFirst({
      where: and(eq(userCourse.userId, userId), eq(userCourse.languageId, languageId)),
    });
    if (!course) return NextResponse.json({ error: "You're not enrolled in this language." }, { status: 404 });
    await db.update(user).set({ activeCourseId: course.id }).where(eq(user.id, userId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    return NextResponse.json({ error: "Couldn't switch language." }, { status: 500 });
  }
}
