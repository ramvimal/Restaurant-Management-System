// Generates content/*.json from builder.mjs (the editable course config).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGES, buildLanguageContent, countExercises } from "./builder.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "content");
mkdirSync(root, { recursive: true });

writeFileSync(join(root, "languages.json"), JSON.stringify(LANGUAGES, null, 2) + "\n");
console.log("wrote content/languages.json");

let total = 0;
for (const lang of LANGUAGES) {
  const content = buildLanguageContent(lang.id);
  const n = countExercises(content);
  total += n;
  writeFileSync(join(root, `${lang.id}.json`), JSON.stringify(content, null, 2) + "\n");
  console.log(`wrote content/${lang.id}.json — ${content.units.length} units, ${n} exercises`);
}
console.log(`\nTotal: ${total} exercises across ${LANGUAGES.length} languages.`);
