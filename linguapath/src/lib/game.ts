// Shared game rules: hearts, streaks, XP, weeks, achievements.
import { eq, inArray, sql } from "drizzle-orm";
import { achievement, user, userAchievement } from "./schema";
import type { Db } from "./db";

export const HEARTS_MAX = 5;
export const HEART_REFILL_MINUTES = 30;
export const GEM_REFILL_COST = 50;

export function weekKey(d = new Date()): string {
  const onejan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) / 7);
  return `${d.getUTCFullYear()}-W${week}`;
}

export function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(aYYYYMMDD: string, bYYYYMMDD: string): number {
  const a = Date.parse(aYYYYMMDD + "T00:00:00Z");
  const b = Date.parse(bYYYYMMDD + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}

/** Hearts refill by 1 per HEART_REFILL_MINUTES. Returns { hearts, nextRefillAt }. */
export function computeHearts(stored: number, updatedAt: Date, now = new Date()) {
  if (stored >= HEARTS_MAX) return { hearts: HEARTS_MAX as number, nextRefillAt: null as Date | null };
  const elapsedMin = Math.floor((now.getTime() - updatedAt.getTime()) / 60000);
  const gained = Math.floor(elapsedMin / HEART_REFILL_MINUTES);
  const hearts = Math.min(HEARTS_MAX, stored + gained);
  const nextRefillAt =
    hearts >= HEARTS_MAX ? null : new Date(updatedAt.getTime() + (gained + 1) * HEART_REFILL_MINUTES * 60000);
  return { hearts, nextRefillAt };
}

/** XP = 10 base + up to 10 accuracy bonus (perfect = 20). */
export function xpForLesson(accuracyPct: number): number {
  return 10 + Math.round((accuracyPct / 100) * 10);
}

/** Returns the new streak count given the last active date. */
export function nextStreakCount(lastActiveDate: string, count: number, today = todayStr()): number {
  if (!lastActiveDate) return 1;
  if (lastActiveDate === today) return count;
  return daysBetween(lastActiveDate, today) === 1 ? count + 1 : 1;
}

export type AchievementContext = {
  accuracyPct: number;
  completedUnit: boolean;
  courseCount: number;
  xpTotal: number;
  streak: number;
};

/** Awards any newly-earned achievements. Returns the unlocked achievement records. */
export async function awardAchievements(db: Db, userId: string, ctx: AchievementContext) {
  const rows = await db.select({ achievementId: userAchievement.achievementId }).from(userAchievement).where(eq(userAchievement.userId, userId));
  const owned = new Set(rows.map((a) => a.achievementId));
  const earn: string[] = [];
  if (!owned.has("first-steps")) earn.push("first-steps");
  if (ctx.accuracyPct >= 100 && !owned.has("sharpshooter")) earn.push("sharpshooter");
  if (ctx.streak >= 3 && !owned.has("streak-3")) earn.push("streak-3");
  if (ctx.streak >= 7 && !owned.has("streak-7")) earn.push("streak-7");
  if (ctx.xpTotal >= 100 && !owned.has("xp-100")) earn.push("xp-100");
  if (ctx.xpTotal >= 1000 && !owned.has("xp-1000")) earn.push("xp-1000");
  if (ctx.completedUnit && !owned.has("scholar")) earn.push("scholar");
  if (ctx.courseCount >= 3 && !owned.has("polyglot")) earn.push("polyglot");

  if (earn.length === 0) return [];
  await db.insert(userAchievement).values(earn.map((achievementId) => ({ userId, achievementId }))).onConflictDoNothing();
  const defs = await db.select().from(achievement).where(inArray(achievement.id, earn));
  const bonus = defs.reduce((n, d) => n + d.xpBonus, 0);
  if (bonus > 0) {
    await db.update(user).set({
      xpTotal: sql`${user.xpTotal} + ${bonus}`,
      weeklyXp: sql`${user.weeklyXp} + ${bonus}`,
    }).where(eq(user.id, userId));
  }
  return defs;
}
