CREATE TABLE `Achievement` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`xpBonus` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Exercise` (
	`id` text PRIMARY KEY NOT NULL,
	`lessonId` text NOT NULL,
	`order` integer NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`question` text NOT NULL,
	`questionLang` text DEFAULT 'en' NOT NULL,
	`answer` text NOT NULL,
	`options` text DEFAULT '[]' NOT NULL,
	`wordBank` text DEFAULT '[]' NOT NULL,
	`pairs` text DEFAULT '[]' NOT NULL,
	`audioText` text DEFAULT '' NOT NULL,
	`readingAid` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`explanation` text DEFAULT '' NOT NULL,
	`hint` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Exercise_lessonId_order` ON `Exercise` (`lessonId`,`order`);--> statement-breakpoint
CREATE TABLE `Language` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`nativeName` text NOT NULL,
	`flag` text NOT NULL,
	`learners` integer DEFAULT 0 NOT NULL,
	`ttsLocale` text NOT NULL,
	`script` text DEFAULT 'latin' NOT NULL,
	`readingAidLabel` text DEFAULT '' NOT NULL,
	`order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Lesson` (
	`id` text PRIMARY KEY NOT NULL,
	`unitId` text NOT NULL,
	`number` integer NOT NULL,
	`title` text NOT NULL,
	`skill` text DEFAULT '' NOT NULL,
	`xpReward` integer DEFAULT 10 NOT NULL,
	`isPlaceholder` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Lesson_unitId_number` ON `Lesson` (`unitId`,`number`);--> statement-breakpoint
CREATE TABLE `Mistake` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`exerciseId` text NOT NULL,
	`languageId` text NOT NULL,
	`timesMissed` integer DEFAULT 1 NOT NULL,
	`nextReview` integer NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`languageId`) REFERENCES `Language`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Mistake_userId_exerciseId` ON `Mistake` (`userId`,`exerciseId`);--> statement-breakpoint
CREATE TABLE `Streak` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`longest` integer DEFAULT 0 NOT NULL,
	`lastActiveDate` text DEFAULT '' NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Streak_userId_unique` ON `Streak` (`userId`);--> statement-breakpoint
CREATE TABLE `Unit` (
	`id` text PRIMARY KEY NOT NULL,
	`languageId` text NOT NULL,
	`number` integer NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`cefr` text NOT NULL,
	`color` text DEFAULT 'brand' NOT NULL,
	`isPlaceholder` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`languageId`) REFERENCES `Language`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Unit_languageId_number` ON `Unit` (`languageId`,`number`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`passwordHash` text,
	`image` text,
	`isBot` integer DEFAULT false NOT NULL,
	`gems` integer DEFAULT 120 NOT NULL,
	`hearts` integer DEFAULT 5 NOT NULL,
	`heartsUpdatedAt` integer NOT NULL,
	`xpTotal` integer DEFAULT 0 NOT NULL,
	`weeklyXp` integer DEFAULT 0 NOT NULL,
	`weekKey` text DEFAULT '' NOT NULL,
	`activeCourseId` text,
	`showReadingAid` integer DEFAULT true NOT NULL,
	`soundEnabled` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE TABLE `UserAchievement` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`achievementId` text NOT NULL,
	`unlockedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`achievementId`) REFERENCES `Achievement`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserAchievement_userId_achievementId` ON `UserAchievement` (`userId`,`achievementId`);--> statement-breakpoint
CREATE TABLE `UserCourse` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`languageId` text NOT NULL,
	`dailyGoalMin` integer DEFAULT 10 NOT NULL,
	`dailyXpGoal` integer DEFAULT 20 NOT NULL,
	`startLevel` text DEFAULT 'scratch' NOT NULL,
	`placedUnit` integer DEFAULT 1 NOT NULL,
	`currentUnit` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`languageId`) REFERENCES `Language`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserCourse_userId_languageId` ON `UserCourse` (`userId`,`languageId`);--> statement-breakpoint
CREATE TABLE `UserProgress` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`lessonId` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`accuracy` real DEFAULT 0 NOT NULL,
	`xpEarned` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`completedAt` integer,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserProgress_userId_lessonId` ON `UserProgress` (`userId`,`lessonId`);--> statement-breakpoint
CREATE TABLE `XPLog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`languageId` text,
	`amount` integer NOT NULL,
	`source` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`languageId`) REFERENCES `Language`(`id`) ON UPDATE no action ON DELETE set null
);
