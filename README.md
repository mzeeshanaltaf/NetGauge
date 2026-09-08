# netgauge

Internet speed test measuring download, upload, latency, jitter, loaded latency and bufferbloat, with per-use-case verdicts. Live at [netgauge.zeeshanai.cloud](https://netgauge.zeeshanai.cloud).

See [CLAUDE.md](CLAUDE.md) for architecture and non-obvious rules, and [STATUS.md](STATUS.md) for build progress.

## Features

- **Download, upload, idle latency, and jitter** measured over 6 parallel streams from Cloudflare's edge, with an exact warm-up discard and adaptive stream sizing.
- **Loaded latency & bufferbloat grading (A+–F)** — pings the connection while it's fully saturated to catch the queuing delay a plain throughput number misses.
- **Per-use-case verdicts** (gaming, video calls, large uploads) instead of a single number to interpret.
- **Light/dark theme**, toggled from the header or following the OS preference, persisted per browser.
- **Shareable results** (`/r/[id]`) with OG-card previews, plus local test history with CSV/JSON export.
- **Installable PWA** and an embeddable, chrome-less `/embed` widget for third-party sites.
- **ISP/network panel** — IP, ASN, ISP, edge location, and approximate city/country for the current test.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npx prisma migrate dev
```

to apply database migrations to the `netgauge` schema.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Recharts · Prisma · Upstash · Cloudflare Workers. See [CLAUDE.md](CLAUDE.md) for why the test traffic runs on a separate Cloudflare Worker instead of Vercel.

## Testing

```bash
npm test        # vitest
npm run lint    # eslint
```

## Deploying the Worker

The data-plane Worker (`worker/`) is deployed separately from the Next.js app:

```bash
cd worker && npx wrangler deploy
```
