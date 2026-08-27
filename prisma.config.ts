import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Match Next.js' env precedence so the CLI sees the same values the app does:
// .env.local wins, .env fills in the rest. (dotenv never overwrites a variable
// that is already set, so loading .env.local first gives it priority.)
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DDL runs on Neon's direct (non-pooled) endpoint — the pooler does not
    // support the session-level operations migrations need. The application
    // itself uses the pooled DATABASE_URL via the adapter in src/lib/db.ts.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
