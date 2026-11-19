import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { initSql } from "./initDb.js";
import * as schema from "./schema.js";

let sqlite: Database.Database | undefined;
let drizzleDb: BetterSQLite3Database<typeof schema> | undefined;

export function openDatabase(filePath: string): void {
  if (sqlite) sqlite.close();
  if (filePath !== ":memory:") {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  sqlite = new Database(filePath);
  if (filePath !== ":memory:") {
    sqlite.pragma("journal_mode = WAL");
  }
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(initSql);
  drizzleDb = drizzle(sqlite, { schema });
}

export function closeDatabase(): void {
  sqlite?.close();
  sqlite = undefined;
  drizzleDb = undefined;
}

export function getSqlite(): Database.Database {
  if (!sqlite) throw new Error("Database is not open");
  return sqlite;
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!drizzleDb) throw new Error("Database is not open");
  return drizzleDb;
}
