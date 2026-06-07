/**
 * Baseline an existing database that was created without Prisma Migrate history.
 * Marks all migrations except the latest as applied, then runs migrate deploy.
 *
 * Usage: npm run db:baseline
 * See: https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/baselining
 */
import { execSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

const migrationsDir = join(process.cwd(), "prisma/migrations")
const migrations = readdirSync(migrationsDir)
  .filter((name) => /^\d+_/.test(name))
  .sort()

if (migrations.length === 0) {
  console.error("No migrations found.")
  process.exit(1)
}

const pending = migrations.slice(0, -1)
const latest = migrations[migrations.length - 1]

console.log(`Baselining ${pending.length} migration(s); deploy will apply: ${latest}`)

for (const name of pending) {
  try {
    execSync(`npx prisma migrate resolve --applied ${name}`, {
      stdio: "inherit",
      env: {
        ...process.env,
        PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT: "60000",
      },
    })
  } catch {
    console.log(`(skip or already applied: ${name})`)
  }
}

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: {
    ...process.env,
    PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT: "60000",
  },
})

console.log("Baseline complete.")
