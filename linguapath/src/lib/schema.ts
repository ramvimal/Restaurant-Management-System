// LinguaPath data model (Drizzle + SQLite via libSQL).
// Single source of truth → SQL migrations via `npx drizzle-kit generate`.
import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "node:crypto";

const id = () => text("id").primaryKey().$defaultFn(() => randomUUID());
const createdAt = () => integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date());
const updatedAt = () =>
  integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date());

// ── Users & auth ──────────────────────────────────────────
export const user = sqliteTable("User", {
  id: id(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash"),
  image: text("image"),
  isBot: integer("isBot", { mode: "boolean" }).notNull().default(false),
  gems: integer("gems").notNull().default(120),
  hearts: integer("hearts").notNull().default(5),
  heartsUpdatedAt: integer("heartsUpdatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  xpTotal: integer("xpTotal").notNull().default(0),
  weeklyXp: integer("weeklyXp").notNull().default(0),
  weekKey: text("weekKey").notNull().default(""),
  activeCourseId: text("activeCourseId"),
  showReadingAid: integer("showReadingAid", { mode: "boolean" }).notNull().default(true),
  soundEnabled: integer("soundEnabled", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const language = sqliteTable("Language", {
  id: text("id").primaryKey(), // "de" | "nl" | "es" | "ko" | "ja"
  name: text("name").notNull(),
  nativeName: text("nativeName").notNull(),
  flag: text("flag").notNull(),
  learners: integer("learners").notNull().default(0),
  ttsLocale: text("ttsLocale").notNull(),
  script: text("script").notNull().default("latin"),
  readingAidLabel: text("readingAidLabel").notNull().default(""),
  order: integer("order").notNull().default(0),
});

export const userCourse = sqliteTable(
  "UserCourse",
  {
    id: id(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    languageId: text("languageId").notNull().references(() => language.id, { onDelete: "cascade" }),
    dailyGoalMin: integer("dailyGoalMin").notNull().default(10),
    dailyXpGoal: integer("dailyXpGoal").notNull().default(20),
    startLevel: text("startLevel").notNull().default("scratch"),
    placedUnit: integer("placedUnit").notNull().default(1),
    currentUnit: integer("currentUnit").notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("UserCourse_userId_languageId").on(t.userId, t.languageId)]
);

// ── Course content ────────────────────────────────────────
export const unit = sqliteTable(
  "Unit",
  {
    id: id(),
    languageId: text("languageId").notNull().references(() => language.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    cefr: text("cefr").notNull(),
    color: text("color").notNull().default("brand"),
    isPlaceholder: integer("isPlaceholder", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [uniqueIndex("Unit_languageId_number").on(t.languageId, t.number)]
);

export const lesson = sqliteTable(
  "Lesson",
  {
    id: id(),
    unitId: text("unitId").notNull().references(() => unit.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    skill: text("skill").notNull().default(""),
    xpReward: integer("xpReward").notNull().default(10),
    isPlaceholder: integer("isPlaceholder", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [uniqueIndex("Lesson_unitId_number").on(t.unitId, t.number)]
);

export const exercise = sqliteTable(
  "Exercise",
  {
    id: id(),
    lessonId: text("lessonId").notNull().references(() => lesson.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    type: text("type").notNull(),
    prompt: text("prompt").notNull(),
    question: text("question").notNull(),
    questionLang: text("questionLang").notNull().default("en"),
    answer: text("answer").notNull(),
    options: text("options").notNull().default("[]"),
    wordBank: text("wordBank").notNull().default("[]"),
    pairs: text("pairs").notNull().default("[]"),
    audioText: text("audioText").notNull().default(""),
    readingAid: text("readingAid").notNull().default(""),
    image: text("image").notNull().default(""),
    explanation: text("explanation").notNull().default(""),
    hint: text("hint").notNull().default(""),
  },
  (t) => [uniqueIndex("Exercise_lessonId_order").on(t.lessonId, t.order)]
);

// ── Progress & gamification ───────────────────────────────
export const userProgress = sqliteTable(
  "UserProgress",
  {
    id: id(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lessonId").notNull().references(() => lesson.id, { onDelete: "cascade" }),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    accuracy: real("accuracy").notNull().default(0),
    xpEarned: integer("xpEarned").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    completedAt: integer("completedAt", { mode: "timestamp" }),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("UserProgress_userId_lessonId").on(t.userId, t.lessonId)]
);

export const streak = sqliteTable("Streak", {
  id: id(),
  userId: text("userId").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  count: integer("count").notNull().default(0),
  longest: integer("longest").notNull().default(0),
  lastActiveDate: text("lastActiveDate").notNull().default(""),
  updatedAt: updatedAt(),
});

export const xpLog = sqliteTable("XPLog", {
  id: id(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  languageId: text("languageId").references(() => language.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(),
  source: text("source").notNull(),
  createdAt: createdAt(),
});

export const achievement = sqliteTable("Achievement", {
  id: text("id").primaryKey(), // "first-steps" etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpBonus: integer("xpBonus").notNull().default(0),
});

export const userAchievement = sqliteTable(
  "UserAchievement",
  {
    id: id(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    achievementId: text("achievementId").notNull().references(() => achievement.id, { onDelete: "cascade" }),
    unlockedAt: integer("unlockedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("UserAchievement_userId_achievementId").on(t.userId, t.achievementId)]
);

export const mistake = sqliteTable(
  "Mistake",
  {
    id: id(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    exerciseId: text("exerciseId").notNull().references(() => exercise.id, { onDelete: "cascade" }),
    languageId: text("languageId").notNull().references(() => language.id, { onDelete: "cascade" }),
    timesMissed: integer("timesMissed").notNull().default(1),
    nextReview: integer("nextReview", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("Mistake_userId_exerciseId").on(t.userId, t.exerciseId)]
);

// ── Relations (for db.query … with: …) ────────────────────
export const userRelations = relations(user, ({ many, one }) => ({
  courses: many(userCourse),
  progress: many(userProgress),
  xpLogs: many(xpLog),
  streak: one(streak, { fields: [user.id], references: [streak.userId] }),
  achievements: many(userAchievement),
  mistakes: many(mistake),
}));

export const languageRelations = relations(language, ({ many }) => ({
  units: many(unit),
  courses: many(userCourse),
  xpLogs: many(xpLog),
  mistakes: many(mistake),
}));

export const userCourseRelations = relations(userCourse, ({ one }) => ({
  user: one(user, { fields: [userCourse.userId], references: [user.id] }),
  language: one(language, { fields: [userCourse.languageId], references: [language.id] }),
}));

export const unitRelations = relations(unit, ({ one, many }) => ({
  language: one(language, { fields: [unit.languageId], references: [language.id] }),
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  unit: one(unit, { fields: [lesson.unitId], references: [unit.id] }),
  exercises: many(exercise),
  progress: many(userProgress),
}));

export const exerciseRelations = relations(exercise, ({ one, many }) => ({
  lesson: one(lesson, { fields: [exercise.lessonId], references: [lesson.id] }),
  mistakes: many(mistake),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(user, { fields: [userProgress.userId], references: [user.id] }),
  lesson: one(lesson, { fields: [userProgress.lessonId], references: [lesson.id] }),
}));

export const streakRelations = relations(streak, ({ one }) => ({
  user: one(user, { fields: [streak.userId], references: [user.id] }),
}));

export const xpLogRelations = relations(xpLog, ({ one }) => ({
  user: one(user, { fields: [xpLog.userId], references: [user.id] }),
  language: one(language, { fields: [xpLog.languageId], references: [language.id] }),
}));

export const achievementRelations = relations(achievement, ({ many }) => ({
  users: many(userAchievement),
}));

export const userAchievementRelations = relations(userAchievement, ({ one }) => ({
  user: one(user, { fields: [userAchievement.userId], references: [user.id] }),
  achievement: one(achievement, { fields: [userAchievement.achievementId], references: [achievement.id] }),
}));

export const mistakeRelations = relations(mistake, ({ one }) => ({
  user: one(user, { fields: [mistake.userId], references: [user.id] }),
  exercise: one(exercise, { fields: [mistake.exerciseId], references: [exercise.id] }),
  language: one(language, { fields: [mistake.languageId], references: [language.id] }),
}));

// ── Row types ─────────────────────────────────────────────
export type UserRow = typeof user.$inferSelect;
export type LanguageRow = typeof language.$inferSelect;
export type UserCourseRow = typeof userCourse.$inferSelect;
export type UnitRow = typeof unit.$inferSelect;
export type LessonRow = typeof lesson.$inferSelect;
export type ExerciseRow = typeof exercise.$inferSelect;
export type UserProgressRow = typeof userProgress.$inferSelect;
export type StreakRow = typeof streak.$inferSelect;
export type XPLogRow = typeof xpLog.$inferSelect;
export type AchievementRow = typeof achievement.$inferSelect;
export type MistakeRow = typeof mistake.$inferSelect;
