# 🦊 LinguaPath — Learn a language the fun way

A Duolingo-inspired, gamified language-learning web app. Pick from **German, Dutch, Spanish, Korean, Japanese**, climb a skill tree from A1 → C1, earn XP, keep streaks alive, and battle in weekly leagues.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind + Drizzle ORM + SQLite (libSQL) + NextAuth + Zustand + Framer Motion**.

> **Stack note:** the original spec called for Prisma + PostgreSQL. Prisma's CLI downloads
> native engines from a CDN at build time, which is unreachable from some sandboxed/offline
> environments — so the data layer uses **Drizzle ORM** instead (same tables, same API, fully
> typed, zero downloads, works everywhere). For production Postgres, swap the libSQL driver
> for `@prisma/adapter-pg`-style Postgres driver (`drizzle-orm/node-postgres`) — no query
> changes needed. See [Deployment](#-deployment).

## ✨ Features

- **Full user flow**: landing → signup/login (email+password, Google optional) → language select → onboarding (daily goal + scratch/placement test) → skill tree → lessons → celebration
- **9 exercise types**: multiple choice (text/image), word-bank translation, typing, listening (choice/type), match pairs, fill-in-the-blank, speaking (mic optional, skippable)
- **Gamification**: XP, 5 hearts with timed refill, gems, day streaks, daily-goal ring, 8 achievements, weekly leaderboard with bots, spaced-repetition Practice mode that reviews mistakes and restores a heart
- **Language-specific**: Hiragana → Katakana → Kanji path for Japanese, Hangul-first for Korean, romaji/romanization toggle, article-focused German/Dutch/Spanish units, CJK fonts + IME-friendly inputs
- **Content**: 3 units × 3 lessons × 10 exercises per language (**450 exercises**) generated from editable config; Units 4–8 (A2–C1) structured as locked roadmap placeholders
- **Polish**: mobile-first responsive, dark mode, chunky 3D buttons, confetti, WebAudio sound effects, TTS pronunciation, keyboard navigation + ARIA labels, loading/empty/error states everywhere, self-hosted fonts (zero runtime CDN calls)

## 🚀 Quick start

```bash
cd linguapath
npm install

# 1. Generate course content JSON from the editable config
npm run content:build

# 2. Create a fresh SQLite DB from drizzle/*.sql
npm run db:push

# 3. Seed languages, lessons, achievements, demo user, leaderboard bots
npm run db:seed

# 4. Run!
npm run dev
```

Open **http://localhost:3000** and log in with the demo account:

- Email: `demo@linguapath.app`
- Password: `linguapath123`

> One-liner for steps 1–3: `npm run setup`

Other scripts: `npm run build` (production build), `npm run typecheck`, `npm run db:generate`
(new migration after editing the schema), `npm run db:studio` (local DB browser).

## ⚙️ Configuration

`.env` is git-ignored; start from `.env.example`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | `file:./data/dev.db` locally; `libsql://…` (Turso) in production |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Auth base URL + session secret (generate a random one for prod) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional — enables Google login when both set |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | Demo login seeded by `db:seed` |

## 📚 Adding / editing course content

All course content lives in **`scripts/content/builder.mjs`** — no component changes needed:

1. Edit `VOCAB` (per-language word banks), `FILL_BLANKS`, or `ROADMAP_UNITS`.
2. To add a language: add a `LANGUAGES` entry + vocab + blanks, then:
   ```bash
   npm run content:build   # regenerates content/*.json
   npm run db:seed         # upserts into DB
   ```

`content/*.json` is the human-readable artifact; the DB is seeded from it.

To evolve the **schema**: edit `src/lib/schema.ts`, run `npm run db:generate`, review
`drizzle/*.sql`, then `npm run db:push` (resets local dev DB) + `npm run db:seed`.

## 🗄️ Database

Drizzle tables (SQLite locally, Postgres-ready): `User, Language, UserCourse, Unit,
Lesson, Exercise, UserProgress, Streak, XPLog, Achievement, UserAchievement, Mistake`.

## 🚢 Deployment

- **Vercel**: push, `npm run build`. Set env vars. For persistence use Turso:
  `DATABASE_URL="libsql://<db>.turso.io"` (+ `authToken` — extend `src/lib/db.ts`
  with `createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })`), then run
  `db:push`/`db:seed` once against it.
- **Postgres (Supabase/Neon)**: change the drizzle driver to `node-postgres`,
  adjust `src/lib/schema.ts` column types (`timestamp` etc.), `db:generate`, migrate.

## 🧱 Project structure

```
src/
  middleware.ts              auth guard (must live in src/ with a src/ app)
  app/
    page.tsx                 landing
    login/ signup/           auth
    languages/ onboarding/   course setup
    placement/[languageId]/  level test
    (app)/ learn|practice|leaderboard|profile|settings
    lesson/[lessonId]/       lesson session
    api/                     REST endpoints (path, lesson, complete-lesson, practice, …)
  components/
    exercises.tsx            9 exercise renderers + grading
    lesson-engine.tsx        runner: progress, hearts, feedback bar
    lesson-complete.tsx      celebration screen
    skill-tree.tsx           zig-zag path
    mascot.tsx               "Pip" the fox (original SVG)
    nav.tsx topbar.tsx ui.tsx …
  lib/ auth.ts db.ts schema.ts game.ts speech.ts sounds.ts store.ts session.ts
scripts/ content/builder.mjs content/build.mjs seed.mjs db-push.mjs
content/ languages.json de.json nl.json es.json ko.json ja.json
drizzle/ 0000_init.sql (+ meta)
```

## 🔜 What to build next

1. **Real A2–C1 content** — fill Units 4–8 via `builder.mjs` (grammar stories, dialogues, verb conjugations).
2. **Stories & audio lessons** — Duolingo-style dialogues with comprehension questions.
3. **Friends & social** — follow friends, friend-only league, XP quests, gifting streak freezes.
4. **Shop** — spend gems on streak freezes, outfits for Pip, bonus hearts.
5. **Push/email reminders** — streak-at-risk notifications (Vercel Cron + Resend).
6. **Placement v2** — adaptive difficulty (CAT) instead of fixed 10 questions.
7. **Offline PWA** — service worker + cached lessons for learning on the metro.
8. **Admin CMS** — web UI for editing content instead of `builder.mjs`.
9. **Tests** — Playwright E2E (signup → lesson → leaderboard) + Vitest for grading logic.
10. **Mistake analytics dashboard** — "your trickiest words" + Postgres full-text search.
