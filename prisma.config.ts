import { defineConfig } from "prisma/config"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

export default defineConfig({
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
