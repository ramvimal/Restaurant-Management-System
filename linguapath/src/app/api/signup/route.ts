import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(120),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
    if (existing) return NextResponse.json({ error: "An account with this email already exists. Try logging in!" }, { status: 409 });
    const passwordHash = await bcrypt.hash(body.password, 10);
    await db.insert(user).values({ name: body.name.trim(), email, passwordHash });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0]?.message || "Invalid input." }, { status: 400 });
    return NextResponse.json({ error: "Couldn't create your account. Try again." }, { status: 500 });
  }
}
