// Language selection screen.
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { asc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { language, userCourse } from "@/lib/schema";
import { LanguageGrid } from "@/components/language-grid";

export default async function LanguagesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/login");

  const [languages, courses] = await Promise.all([
    db.query.language.findMany({ orderBy: asc(language.order) }),
    db.query.userCourse.findMany({ where: eq(userCourse.userId, userId), columns: { languageId: true } }),
  ]);
  const enrolled = new Set(courses.map((c) => c.languageId));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="text-center text-xs font-extrabold uppercase tracking-widest text-brand-600">🦊 Pip is excited!</p>
      <h1 className="mt-1 text-center text-3xl font-black">Which language will you learn?</h1>
      <p className="mt-1 text-center font-bold text-slate-400">You can add more later — your progress is saved per language.</p>
      <LanguageGrid languages={languages} enrolledIds={Array.from(enrolled)} />
    </div>
  );
}
