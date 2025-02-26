import { defineConfig } from "drizzle-kit";

// Allow running without DATABASE_URL in development mode
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/apartment_master";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
