# netgauge

Internet speed test measuring download, upload, latency, jitter, **loaded latency and bufferbloat**, with per-use-case verdicts. Live at `netgauge.zeeshanai.cloud`.

> **Start every session by reading [STATUS.md](STATUS.md)** for current progress, then the relevant `docs/phase-N-*.md`.

## Architecture

```
Browser
  ├── UI, share pages, OG ──────> Vercel (Next.js 15 App Router)
  │                                 ├── Prisma ─> 76.13.7.106:5432 (schema: netgauge)
  │                                 ├── Upstash Redis (rate limiting)
  │                                 └── n8n webhook (contact form)
  └── test bytes ───────────────> Cloudflare Worker (free tier, global)
```

**Why the split:** a speed test is a bandwidth application. On Vercel the bytes cost ~1–4¢/test past 1 TB. On the Hostinger VPS they would fight 18 co-tenant apps for 2 vCPUs and — being a single datacenter — would measure the undersea path for distant users instead of their line. Cloudflare's 300+ PoPs fix both, free. **Test traffic must never touch Vercel or the VPS.**

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Recharts · Prisma · Upstash · Cloudflare Workers

## Non-obvious rules

**The database is shared with other apps.** `DATABASE_URL` points at the VPS Postgres used by difflab and others. This app owns **only the `netgauge` schema**. Never drop, migrate, or query outside it. Keep `connection_limit=1` in the URL — it is what makes a direct Postgres connection safe under serverless concurrency.

**Never persist raw IPs.** Store `sha256(ip + IP_HASH_SALT)`. The user's own IP may be shown client-side but is not written to the database.

**The Worker must not compress or buffer.** Serve `Content-Encoding: identity` and `Cache-Control: no-store, no-transform` from a `ReadableStream`. A repeated chunk compresses to nothing and reports fake gigabit speeds. Always send `Timing-Allow-Origin: *` — without it, cross-origin `PerformanceResourceTiming` returns zeros and measurement silently reads 0.

**Upload measurement requires `XMLHttpRequest`.** `fetch` exposes no upload progress, so byte accounting is impossible with it. Use `xhr.upload.onprogress`.

**The homepage is a split render, deliberately.** `app/page.tsx` stays a Server Component (H1, copy, FAQ) for LCP and crawlability; only the interactive widget is `dynamic(..., { ssr: false })` inside a fixed-height placeholder. Both failure modes are silent: no `ssr: false` → Start button renders but does nothing; `ssr: false` everywhere → empty HTML shell that cannot rank.

**Run the measurement engine in a Web Worker.** Byte-counting six concurrent stream readers on the main thread blows the <200 ms INP budget on a page about performance.

**`/r/[id]` pages are server-rendered but `noindex`.** Rendering makes OG cards unfurl; indexing thousands of near-identical results would be thin duplicate content and drag the whole site down. Both are correct together.

**Vercel geo headers are empty on localhost.** The ISP panel needs a graceful fallback; verify it on a preview deploy, not `next dev`.

**Cloudflare's free tier gives `request.cf.asn` and `.colo` but not `city`/`country`.** ASN/ISP come from the Worker, city/country from Vercel. Neither source alone is sufficient.

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
