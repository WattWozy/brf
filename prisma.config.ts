import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moved the connection URL out of schema.prisma. The CLI
// (migrate / db push / studio) reads it from here; the runtime client gets
// its connection via a driver adapter (see src/infra/db/client.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
