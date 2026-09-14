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
    // Migrations need a session-level connection (advisory locks, multi-statement
    // DDL). Supabase's session pooler on :5432 provides one, so DIRECT_URL may
    // equal DATABASE_URL; never point it at the transaction pooler on :6543.
    // The application itself connects via the adapter in src/lib/db.ts.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
