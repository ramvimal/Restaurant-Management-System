// Local DB setup: recreates data/dev.db from drizzle/*.sql (fresh each run).
import "dotenv/config";
import { readFileSync, readdirSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.DATABASE_URL || "file:./data/dev.db";
const file = url.startsWith("file:") ? url.slice(5) : url;
const abs = join(root, file);

mkdirSync(dirname(abs), { recursive: true });
if (existsSync(abs)) rmSync(abs);
console.log(`creating fresh DB at ${file}`);

const client = createClient({ url: "file:" + abs });
const files = readdirSync(join(root, "drizzle")).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  const sql = readFileSync(join(root, "drizzle", f), "utf8");
  const statements = sql.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
  for (const s of statements) await client.execute(s);
  console.log(`applied ${f} (${statements.length} statements)`);
}
client.close();
console.log("DB ready ✔");
