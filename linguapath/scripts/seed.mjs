// Seeds the DB from content/*.json + demo user + leaderboard bots + achievements.
// Raw SQL via libSQL (no ORM needed for seeding).
import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { createClient } from "@libsql/client";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "content");
const read = (f) => JSON.parse(readFileSync(join(dir, f), "utf8"));

const url = process.env.DATABASE_URL || "file:./data/dev.db";
const abs = url.startsWith("file:") ? join(root, url.slice(5)) : url;
const client = createClient({ url: url.startsWith("file:") ? "file:" + abs : url });

const ACHIEVEMENTS = [
  { id: "first-steps", title: "First Steps", description: "Complete your first lesson", icon: "🎯", xpBonus: 20 },
  { id: "sharpshooter", title: "Sharpshooter", description: "Finish a lesson with 100% accuracy", icon: "🏹", xpBonus: 15 },
  { id: "streak-3", title: "Warming Up", description: "Reach a 3-day streak", icon: "🔥", xpBonus: 30 },
  { id: "streak-7", title: "On Fire", description: "Reach a 7-day streak", icon: "⚡", xpBonus: 60 },
  { id: "xp-100", title: "Century", description: "Earn 100 total XP", icon: "💯", xpBonus: 25 },
  { id: "xp-1000", title: "Unstoppable", description: "Earn 1,000 total XP", icon: "🚀", xpBonus: 100 },
  { id: "scholar", title: "Scholar", description: "Complete a full unit", icon: "🎓", xpBonus: 50 },
  { id: "polyglot", title: "Polyglot", description: "Start learning 3 languages", icon: "🌍", xpBonus: 40 },
];

const BOTS = [
  ["Ava", 320], ["Liam", 285], ["Mia", 260], ["Noah", 231], ["Yuki", 198],
  ["Sofia", 172], ["Leo", 149], ["Emma", 121], ["Kai", 96], ["Zoe", 74], ["Max", 51], ["Ivy", 33],
];

function weekKey(d = new Date()) {
  const onejan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) / 7);
  return `${d.getUTCFullYear()}-W${week}`;
}

async function main() {
  const now = Date.now();

  for (const a of ACHIEVEMENTS) {
    await client.execute({
      sql: `INSERT INTO "Achievement" (id, title, description, icon, xpBonus) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, icon=excluded.icon, xpBonus=excluded.xpBonus`,
      args: [a.id, a.title, a.description, a.icon, a.xpBonus],
    });
  }
  console.log("seeded achievements");

  const languages = read("languages.json");
  for (const lang of languages) {
    await client.execute({
      sql: `INSERT INTO "Language" (id, name, nativeName, flag, learners, ttsLocale, script, readingAidLabel, "order")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name=excluded.name, nativeName=excluded.nativeName, flag=excluded.flag,
              learners=excluded.learners, ttsLocale=excluded.ttsLocale, script=excluded.script,
              readingAidLabel=excluded.readingAidLabel, "order"=excluded."order"`,
      args: [lang.id, lang.name, lang.nativeName, lang.flag, lang.learners, lang.ttsLocale, lang.script, lang.readingAidLabel, lang.order],
    });
    const content = read(`${lang.id}.json`);
    for (const u of content.units) {
      let row = await client.execute({ sql: `SELECT id FROM "Unit" WHERE languageId = ? AND number = ?`, args: [lang.id, u.number] });
      let unitId = row.rows[0]?.id;
      if (!unitId) {
        unitId = randomUUID();
        await client.execute({
          sql: `INSERT INTO "Unit" (id, languageId, number, title, description, cefr, color, isPlaceholder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [unitId, lang.id, u.number, u.title, u.description, u.cefr, u.color, u.isPlaceholder ? 1 : 0],
        });
      } else {
        await client.execute({
          sql: `UPDATE "Unit" SET title=?, description=?, cefr=?, color=?, isPlaceholder=? WHERE id=?`,
          args: [u.title, u.description, u.cefr, u.color, u.isPlaceholder ? 1 : 0, unitId],
        });
      }
      for (const l of u.lessons) {
        let lrow = await client.execute({ sql: `SELECT id FROM "Lesson" WHERE unitId = ? AND number = ?`, args: [unitId, l.number] });
        let lessonId = lrow.rows[0]?.id;
        if (!lessonId) {
          lessonId = randomUUID();
          await client.execute({
            sql: `INSERT INTO "Lesson" (id, unitId, number, title, skill, xpReward, isPlaceholder) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [lessonId, unitId, l.number, l.title, l.skill, l.xpReward, l.isPlaceholder ? 1 : 0],
          });
        } else {
          await client.execute({
            sql: `UPDATE "Lesson" SET title=?, skill=?, xpReward=?, isPlaceholder=? WHERE id=?`,
            args: [l.title, l.skill, l.xpReward, l.isPlaceholder ? 1 : 0, lessonId],
          });
        }
        await client.execute({ sql: `DELETE FROM "Exercise" WHERE lessonId = ?`, args: [lessonId] });
        for (const e of l.exercises || []) {
          await client.execute({
            sql: `INSERT INTO "Exercise" (id, lessonId, "order", type, prompt, question, questionLang, answer, options, wordBank, pairs, audioText, readingAid, image, explanation, hint)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [randomUUID(), lessonId, e.order, e.type, e.prompt, e.question, e.questionLang || "en", e.answer,
              e.options || "[]", e.wordBank || "[]", e.pairs || "[]", e.audioText || "", e.readingAid || "",
              e.image || "", e.explanation || "", e.hint || ""],
          });
        }
      }
    }
    console.log(`seeded ${lang.name}`);
  }

  const demoEmail = process.env.DEMO_EMAIL || "demo@linguapath.app";
  const demoPass = process.env.DEMO_PASSWORD || "linguapath123";
  const passwordHash = await bcrypt.hash(demoPass, 10);
  await client.execute({
    sql: `INSERT INTO "User" (id, name, email, passwordHash, isBot, gems, hearts, heartsUpdatedAt, xpTotal, weeklyXp, weekKey, showReadingAid, soundEnabled, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, 0, 150, 5, ?, 0, 0, ?, 1, 1, ?, ?)
          ON CONFLICT(email) DO UPDATE SET name=excluded.name, passwordHash=excluded.passwordHash`,
    args: [randomUUID(), "Demo Learner", demoEmail, passwordHash, now, "", now, now],
  });
  console.log(`demo user ready: ${demoEmail} / ${demoPass}`);

  const wk = weekKey();
  for (const [name, xp] of BOTS) {
    const email = `bot-${name.toLowerCase()}@linguapath.app`;
    await client.execute({
      sql: `INSERT INTO "User" (id, name, email, isBot, gems, hearts, heartsUpdatedAt, xpTotal, weeklyXp, weekKey, showReadingAid, soundEnabled, createdAt, updatedAt)
            VALUES (?, ?, ?, 1, 100, 5, ?, ?, ?, ?, 1, 1, ?, ?)
            ON CONFLICT(email) DO UPDATE SET weeklyXp=excluded.weeklyXp, weekKey=excluded.weekKey, xpTotal=excluded.xpTotal`,
      args: [randomUUID(), name, email, now, xp * 6, xp, wk, now, now],
    });
    const brow = await client.execute({ sql: `SELECT id FROM "User" WHERE email = ?`, args: [email] });
    const botId = brow.rows[0].id;
    await client.execute({
      sql: `INSERT INTO "UserCourse" (id, userId, languageId, dailyGoalMin, dailyXpGoal, startLevel, placedUnit, currentUnit, createdAt, updatedAt)
            VALUES (?, ?, 'es', 10, 20, 'scratch', 1, 1, ?, ?) ON CONFLICT(userId, languageId) DO NOTHING`,
      args: [randomUUID(), botId, now, now],
    });
  }
  console.log("seed complete ✔");
  client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
