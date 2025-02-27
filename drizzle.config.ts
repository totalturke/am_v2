import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

// Allow running without DATABASE_URL in development mode
const databaseUrl = process.env.DATABASE_URL || "./data/sqlite.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
