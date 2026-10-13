import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

// Reuse one connection pool across hot reloads in dev.
const globalForDb = globalThis as unknown as { db?: Database };

// Connect lazily so `next build` doesn't need DATABASE_URL.
export function getDb(): Database {
  if (!globalForDb.db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example to .env.local.",
      );
    }
    globalForDb.db = drizzle(process.env.DATABASE_URL, { schema });
  }
  return globalForDb.db;
}
