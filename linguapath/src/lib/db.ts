import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type Db = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __linguaDb?: Db; __linguaClient?: Client };

function createDb(): Db {
  const client = createClient({ url: process.env.DATABASE_URL || "file:./data/dev.db" });
  globalForDb.__linguaClient = client;
  return drizzle(client, { schema });
}

export const db: Db = globalForDb.__linguaDb ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.__linguaDb = db;
