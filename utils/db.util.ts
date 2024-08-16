import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
// import Database from 'better-sqlite3';
import * as schema from "../migrations/schema";

const sqlite = new Database('test.db');

export const db = drizzle(sqlite, { schema });