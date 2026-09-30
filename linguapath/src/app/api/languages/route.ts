import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { language, user, userCourse } from "@/lib/schema";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [languages, courses, found] = await Promise.all([
    db.query.language.findMany({ orderBy: asc(language.order) }),
    db.query.userCourse.findMany({ where: eq(userCourse.userId, userId), with: { language: true } }),
    db.query.user.findFirst({ where: eq(user.id, userId), columns: { activeCourseId: true } }),
  ]);
  return NextResponse.json({ languages, courses, activeCourseId: found?.activeCourseId ?? null });
}
