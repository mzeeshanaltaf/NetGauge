# Phase 1 — Foundation

**Goal:** A running Next.js skeleton with correct env, tooling, and DB schema. No features yet.

**Prerequisites:** None. This is the first phase.

---

## Steps

### 1. Fix the environment file (do this first)

`.env.local` already exists. Two corrections:

- **`DATABASE_URL` ends in `?schema=difflab`** — change to **`?schema=netgauge`**. Left as-is, this app creates its tables inside the difflab app's schema. This is the single most important line in this phase.
- Keep `connection_limit=1&pool_timeout=20` — that is what makes a direct Postgres connection safe under Vercel's serverless concurrency.

Add:
```
NEXT_PUBLIC_SITE_URL=https://netgauge.zeeshanai.cloud
IP_HASH_SALT=<generate a long random string>
```
`NEXT_PUBLIC_WORKER_URL` is added in Phase 2.

### 2. Scaffold

```
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*"
```
Then `npx shadcn@latest init`. Add `recharts`, `@prisma/client`, `nanoid`, `@upstash/redis`, `@upstash/ratelimit`, `@vercel/functions`.

### 3. Git

`git init`, and **put `.env.local` in `.gitignore` in the very first commit** — it holds live database and API credentials.

### 4. Prisma

Use the `prisma-database-setup` skill. One model, mapped to the `netgauge` schema:

```prisma
model Result {
  id            String   @id
  createdAt     DateTime @default(now())
  downloadMbps  Decimal
  uploadMbps    Decimal
  idleMs        Decimal
  jitterMs      Decimal
  loadedDownMs  Decimal
  loadedUpMs    Decimal
  bufferbloat   String
  isp           String?
  asn           Int?
  colo          String?
  city          String?
  country       String?
  ipHash        String
  @@map("results")
}
```

Add `multiSchema` / `schemas = ["netgauge"]` to the datasource so Prisma scopes itself correctly. Then `npx prisma migrate dev`.

**Recommended (not required):** create a dedicated Postgres role owning only the `netgauge` schema, so a leak of this app's credentials cannot reach difflab or any other app's data. The current URL uses the `postgres` superuser.

### 5. Layout shell

`app/layout.tsx` with `<html lang="en">`, `next/font` (subset it), and a footer linking About / Contact / Privacy. Dark mode via CSS variables.

---

## Files

`.env.local` (edit) · `.gitignore` · `package.json` · `app/layout.tsx` · `app/page.tsx` (placeholder) · `prisma/schema.prisma` · `lib/db.ts`

---

## Verification

- `npm run dev` serves a page at localhost:3000.
- `npx prisma migrate status` is clean.
- **In psql: `\dt netgauge.*` shows the `results` table, and `\dt difflab.*` is unchanged.** This is the check that matters.
- `git status` does **not** list `.env.local`.

## Done when

App boots, migration applied to the `netgauge` schema, difflab untouched, secrets not tracked by git.
