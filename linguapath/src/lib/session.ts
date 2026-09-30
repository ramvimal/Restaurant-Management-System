import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { authOptions } from "./auth";
import { db } from "./db";
import { user } from "./schema";
import { computeHearts, weekKey } from "./game";

export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

/** Loads the user and applies time-based updates (heart refill, weekly reset). */
export async function getActiveUser() {
  const id = await getSessionUserId();
  if (!id) return null;
  const found = await db.query.user.findFirst({ where: eq(user.id, id) });
  if (!found) return null;
  const { hearts } = computeHearts(found.hearts, found.heartsUpdatedAt);
  const wk = weekKey();
  if (hearts !== found.hearts || found.weekKey !== wk) {
    await db.update(user).set({
      hearts,
      ...(found.weekKey !== wk ? { weeklyXp: 0, weekKey: wk } : {}),
    }).where(eq(user.id, id));
    return (await db.query.user.findFirst({ where: eq(user.id, id) }))!;
  }
  return found;
}
