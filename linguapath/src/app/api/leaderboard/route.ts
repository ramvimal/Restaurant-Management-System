import { NextResponse } from "next/server";
import { desc, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { getActiveUser, getSessionUserId } from "@/lib/session";
import { weekKey } from "@/lib/game";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await getActiveUser(); // applies weekly reset for the requester
  const wk = weekKey();
  // Reset anyone whose week rolled over so the league is always current.
  await db.update(user).set({ weeklyXp: 0, weekKey: wk }).where(ne(user.weekKey, wk));

  const entries = await db
    .select({ id: user.id, name: user.name, image: user.image, weeklyXp: user.weeklyXp, isBot: user.isBot })
    .from(user)
    .orderBy(desc(user.weeklyXp), desc(user.xpTotal))
    .limit(30);
  const rank = entries.findIndex((e) => e.id === userId) + 1;
  return NextResponse.json({
    weekKey: wk,
    entries: entries.map((e) => ({ ...e, isMe: e.id === userId })),
    myRank: rank || null,
  });
}
