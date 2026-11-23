# netgauge

Internet speed test measuring download, upload, latency, jitter, **loaded latency and bufferbloat**, with per-use-case verdicts. Live at `netgauge.zeeshanai.cloud`.

> **Start every session by reading [STATUS.md](STATUS.md)** for current progress, then the relevant `docs/phase-N-*.md`.

## Architecture

```
Browser
  ├── UI, share pages, OG ──────> Hostinger VPS, Coolify app `netgauge` (Next.js 15, railpack)
  │                                 ├── Prisma ─> 10.0.0.1:5432 (shared Postgres, schema: netgauge)
  │                                 ├── Upstash Redis (rate limiting)
  │                                 └── n8n webhook (contact form)
  └── test bytes, ISP + geo ────> Cloudflare Worker (free tier, global)
```

**Why the split:** a speed test is a bandwidth application. On the Hostinger VPS the bytes would fight 18+ co-tenant apps for 2 vCPUs and — being a single datacenter — would measure the undersea path for distant users instead of their line. Cloudflare's 300+ PoPs fix that, free. **Test traffic must never touch the VPS.**

**Hosting (since 2026-11-23):** the app runs on Coolify (application uuid `sip1y4bo6jywv6aalqvyqn5g`, project `NetGauge`), not Vercel — the VPS Postgres is no longer reachable from the public internet. Deploys go through `.github/workflows/deploy.yml` (repo secrets `COOLIFY_API_TOKEN`, `COOLIFY_APP_UUID`). `NEXT_PUBLIC_*` and `DATABASE_URL` are Coolify **build-time** vars (`prisma generate` in `postinstall` reads `DATABASE_URL`); changing one needs a rebuild. Don't set `NODE_ENV` at build time — `npm install` would skip the devDependencies the build needs. Locally, `DATABASE_URL` uses the Tailscale host `100.79.243.92`.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Recharts · Prisma · Upstash · Cloudflare Workers

## Non-obvious rules

**The database is shared with other apps.** `DATABASE_URL` points at the VPS Postgres used by difflab and others. This app owns **only the `netgauge` schema**. Never drop, migrate, or query outside it. Keep `connection_limit=1` in the URL — the shared Postgres has many tenants and this app needs very few connections.

**Never persist raw IPs.** Store `sha256(ip + IP_HASH_SALT)`. The user's own IP may be shown client-side but is not written to the database.

**The Worker must not compress or buffer.** Serve `Content-Encoding: identity` and `Cache-Control: no-store, no-transform` from a `ReadableStream`. A repeated chunk compresses to nothing and reports fake gigabit speeds. Always send `Timing-Allow-Origin: *` — without it, cross-origin `PerformanceResourceTiming` returns zeros and measurement silently reads 0.

**Upload measurement requires `XMLHttpRequest`.** `fetch` exposes no upload progress, so byte accounting is impossible with it. Use `xhr.upload.onprogress`.

**The homepage is a split render, deliberately.** `app/page.tsx` stays a Server Component (H1, copy, FAQ) for LCP and crawlability; only the interactive widget is `dynamic(..., { ssr: false })` inside a fixed-height placeholder. Both failure modes are silent: no `ssr: false` → Start button renders but does nothing; `ssr: false` everywhere → empty HTML shell that cannot rank.

**Run the measurement engine in a Web Worker.** Byte-counting six concurrent stream readers on the main thread blows the <200 ms INP budget on a page about performance.

**`/r/[id]` pages are server-rendered but `noindex`.** Rendering makes OG cards unfurl; indexing thousands of near-identical results would be thin duplicate content and drag the whole site down. Both are correct together.

**ISP and location both come from the Worker's `/meta`** (`request.cf`: asn, asOrganization, colo, city, country, region, lat/lon). There is no server-side geo source on the VPS; any field can be null, and the ISP panel falls back gracefully.

**Client IP comes from the proxy headers.** `lib/client-ip.ts` reads `X-Real-Ip` / `X-Forwarded-For` as set by Coolify's Traefik. Never trust them if the app is ever put behind another proxy without re-checking which hop sets them.

## Layout

```
app/          routes; page.tsx is a Server Component
components/   UI; speed-test.tsx is the client entry
lib/speedtest/  measurement engine — no React imports, reused by /embed
worker/       Cloudflare Worker (separate deploy: npx wrangler deploy)
docs/         phase-by-phase implementation plans
```

## Commands

```bash
npm run dev
npx prisma migrate dev
cd worker && npx wrangler deploy
```

## Verification that matters

Numbers must land **within ~10% of fast.com and speed.cloudflare.com** on the same connection. Way too high → compression is on. Consistently low → warm-up not discarded or too few streams. Zero/NaN → missing `Timing-Allow-Origin`.
