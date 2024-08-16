import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from 'bun:sqlite';
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

async function main() {
  // run migratoin
  const migrationClient = new Database("test.db");
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./migrations",
  });
  // close connection
  await migrationClient.close();
}

main();
