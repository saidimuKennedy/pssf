# PSSF — Deployment and Environment Document

**Version:** 1.1  
**Status:** Approved for implementation

---

## Overview

The platform is a single Next.js application deployed on Vercel. The database is a managed PostgreSQL instance. No separate backend service is required.

---

## Environments

| Environment | Purpose | Database |
|---|---|---|
| `development` | Local development | Local PostgreSQL or Docker |
| `preview` | Branch preview deployments on Vercel | Shared staging database |
| `production` | Live application | Production PostgreSQL |

---

## Environment Variables

All secrets are stored in Vercel environment variables. Never committed to source control.

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/pssf_db

# Auth.js
AUTH_SECRET=                        # 32-character random string
AUTH_URL=                           # Production URL e.g. https://pssf.go.ke

# Chatnation CRM (WhatsApp + OTP)
CHATNATION_CRM_URL=
CHATNATION_CRM_API_KEY=

# Resend (Email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@pssf.go.ke

# App
NEXT_PUBLIC_APP_URL=                # Public-facing URL
NODE_ENV=production
```

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or Docker)
- npm

### Steps

```bash
# Clone repository
git clone https://github.com/org/pssf-platform.git
cd pssf-platform

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Fill in .env.local with local database URL and placeholder values
# for CRM and Resend (mock handlers used in development)

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

Application runs at `http://localhost:3000`

---

## Database Migrations

Migrations are managed by Prisma Migrate.

### Create a migration

```bash
npx prisma migrate dev --name describe_the_change
```

### Apply migrations in production

```bash
npx prisma migrate deploy
```

`migrate deploy` is run automatically as part of the Vercel build step via a `postbuild` script in `package.json`:

```json
"scripts": {
  "build": "next build",
  "postbuild": "prisma migrate deploy"
}
```

This ensures migrations run before the new deployment goes live.

### Migration rules

- Never edit a committed migration file
- Never run `migrate reset` on production
- All schema changes go through a new migration
- Migration names describe the change: `add_case_notes_table`, `add_document_condition_field`

---

## Seed Data

```bash
# Run seed script (development and staging only — never production unless explicitly intended)
npx prisma db seed
```

The seed script lives at `prisma/seed.ts`. It runs in the order defined in the seed data specification document:

1. Employers
2. Users
3. Members
4. Employer officers
5. Cases
6. Case status history
7. Documents
8. Approvals
9. Tasks
10. Beneficiaries
11. Contributions
12. Notification rules
13. Notifications
14. Audit events

The seed script is idempotent — running it twice does not create duplicate records. It uses `upsert` operations keyed on stable identifiers (national ID, email, employer code).

---

## Vercel Deployment

### Branch strategy

| Branch | Deployment | Environment |
|---|---|---|
| `main` | Production | production variables |
| `develop` | Preview | staging variables |
| Feature branches | Preview | staging variables |

### Build configuration (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Deployment steps

1. Push to `main`
2. Vercel triggers build
3. `npm run build` runs — includes `prisma migrate deploy` as postbuild
4. Build passes — deployment goes live
5. Build fails — previous deployment remains live — no downtime

---

## Application Structure

```
pssf-platform/
│
├── app/                    # Next.js App Router
├── auth.ts                 # Auth.js v5 config (project root)
├── middleware.ts            # Route protection (project root)
├── components/             # Shared UI components
├── emails/                 # React Email templates
├── lib/                    # Server-side logic
│   ├── db.ts               # Prisma client singleton
│   ├── state-machine/      # Case transition engine
│   ├── notifications/      # Notification dispatch
│   ├── documents/          # Document handling
│   └── validations/        # Zod schemas
├── prisma/
│   ├── schema.prisma       # Database schema (no url in datasource)
│   ├── migrations/         # Migration history
│   └── seed.ts             # Seed script
├── prisma.config.ts        # Prisma 7 connection config
├── public/                 # Static assets
├── types/                  # TypeScript type extensions
├── .env.example            # Environment variable template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Prisma 7 Configuration

This project uses **Prisma 7**. The database connection URL is not in `schema.prisma`. It lives in `prisma.config.ts` at the project root.

### prisma.config.ts

```typescript
import { defineConfig } from "prisma/config"

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
```

### prisma/schema.prisma datasource block

```prisma
datasource db {
  provider = "postgresql"
}
```

**Do not add `url = env("DATABASE_URL")` to the datasource block.** That is the Prisma 6 and earlier pattern and will cause a validation error in Prisma 7.

---

## Prisma Client Singleton

To prevent connection pool exhaustion in Next.js development:

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
```

---

## Mock Services (Development)

In development, CRM and email calls are intercepted by mock handlers that log to the console rather than making real API calls.

```typescript
// lib/notifications/channels/whatsapp.ts
if (process.env.NODE_ENV === "development") {
  console.log("[MOCK WhatsApp]", payload)
  return
}
// real dispatch below
```

This means the full notification flow can be tested locally without CRM credentials.

---

## Health Check

```
GET /api/health
```

Returns:

```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Used by Vercel uptime monitoring and any future infrastructure health checks.

---

## Production Checklist

Before going live:

- [ ] All environment variables set in Vercel production environment
- [ ] `AUTH_SECRET` is a unique random string — not shared with staging
- [ ] `DATABASE_URL` points to production database
- [ ] Database migrations applied and verified
- [ ] Seed data loaded (if demo) or empty (if clean launch)
- [ ] Chatnation CRM URL and API key verified
- [ ] Resend API key verified with correct `from` email domain
- [ ] Custom domain configured in Vercel
- [ ] Auth.js `AUTH_URL` set to production domain
- [ ] Health check endpoint returning OK
- [ ] All staff and admin users created via admin panel
