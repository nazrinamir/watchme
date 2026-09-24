import "server-only";
import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

function createSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return postgres(url, {
    ssl: "require",
    max: 1,
    connect_timeout: 15,
    // Transaction pooler (port 6543) does not support prepared statements.
    prepare: false,
  });
}

export const sql = globalForDb.sql ?? createSql();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}
