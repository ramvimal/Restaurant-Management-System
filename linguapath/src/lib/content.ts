// Shared DTO types for course content (server → client).
export type ExerciseDTO = {
  id: string;
  order: number;
  type: string;
  prompt: string;
  question: string;
  questionLang: string;
  answer: string;
  options: string[];
  wordBank: string[];
  pairs: [string, string][];
  audioText: string;
  readingAid: string;
  image: string;
  explanation: string;
  hint: string;
  ttsLocale: string;
};

export type LessonState = "locked" | "active" | "completed";

export type LessonDTO = {
  id: string;
  number: number;
  title: string;
  skill: string;
  xpReward: number;
  isPlaceholder: boolean;
  state: LessonState;
  accuracy: number | null;
};

export type UnitDTO = {
  id: string;
  number: number;
  title: string;
  description: string;
  cefr: string;
  color: string;
  isPlaceholder: boolean;
  locked: boolean;
  lessons: LessonDTO[];
};

export type PathDTO = {
  language: { id: string; name: string; nativeName: string; flag: string; ttsLocale: string; readingAidLabel: string; script: string };
  course: { dailyGoalMin: number; dailyXpGoal: number; placedUnit: number; currentUnit: number };
  units: UnitDTO[];
  progress: { completedLessons: number; totalLessons: number };
};

export function parseJsonArray<T = string>(raw: string): T[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
