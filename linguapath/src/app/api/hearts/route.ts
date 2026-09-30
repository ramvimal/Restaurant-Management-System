import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { getActiveUser } from "@/lib/session";
import { GEM_REFILL_COST, HEARTS_MAX } from "@/lib/game";

const schema = z.object({ action: z.literal("refill") });

export async function POST(req: Request) {
  const current = await getActiveUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    schema.parse(await req.json());
    if (current.hearts >= HEARTS_MAX) return NextResponse.json({ error: "Your hearts are already full!" }, { status: 400 });
    if (current.gems < GEM_REFILL_COST) {
      return NextResponse.json({ error: `You need ${GEM_REFILL_COST} gems. Earn more by finishing lessons!` }, { status: 400 });
    }
    await db.update(user).set({ gems: sql`${user.gems} - ${GEM_REFILL_COST}`, hearts: HEARTS_MAX }).where(eq(user.id, current.id));
    return NextResponse.json({ ok: true, hearts: HEARTS_MAX });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    return NextResponse.json({ error: "Couldn't refill hearts." }, { status: 500 });
  }
}
