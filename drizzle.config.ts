import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./migrations/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "test.db",
  },
  verbose: process.env.NODE_ENV !== "production",
});
