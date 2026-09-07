# Phase 4 — Test UI

**Goal:** The visible product — gauge, live chart, results, connection panel.

**Prerequisites:** Phase 3 (engine must already produce correct numbers).

---

## The structural decision — get this right first

The test UI initialises state from browser-only APIs (`crypto.randomUUID`, `performance.now`, `navigator.connection`). The global guideline says wrap such a tree in `next/dynamic` with `{ ssr: false }`. But applying that to the **whole page** leaves nothing server-rendered, which guts LCP and hides the page text from crawlers (Phase 8 depends on it).

**Split it:**

- `app/page.tsx` stays a **Server Component** — H1, intro copy, FAQ, footer. Crawlable text, fast LCP.
- Only the interactive widget is `dynamic(() => import('@/components/speed-test'), { ssr: false })`, mounted into a **fixed-height placeholder** so the gauge appearing causes no layout shift (this is also the CLS fix).

Both failure modes here are silent:
- No `ssr: false` -> Start button renders but does nothing, clean console.
- `ssr: false` on everything -> `curl` returns an empty shell, page cannot rank.

---

## Components

- **Gauge** — animated arc, current Mbps, phase label (ping / download / upload). Fixed dimensions.
- **Live throughput chart** — Recharts, streaming from the engine's progress events.
- **Result card** — download, upload, idle ping, jitter, loaded latency down/up, bufferbloat grade, use-case verdicts.
- **Connection & ISP panel** — composed from two free sources, because neither alone is sufficient:
  - **Worker `/meta`** -> public IP, ASN, ISP name, Cloudflare PoP.
  - **Vercel geo headers** via `@vercel/functions` `geolocation()` -> city, country, region, lat/lon. **These are empty on localhost** — code a graceful fallback or local dev will look broken, and verify this panel on a preview deploy, not `next dev`.
  - Client-side: `navigator.connection` (effectiveType/downlink), UA for browser/OS.

Show the user their own IP client-side. **Never persist the raw IP** (see Phase 5).

---

## Files

`app/page.tsx` (server) · `app/api/geo/route.ts` · `components/speed-test.tsx` (client entry) · `components/{gauge,live-chart,result-card,isp-panel}.tsx`

---

## Verification

- Full test runs end to end and the numbers match Phase 3's standalone harness.
- **`curl localhost:3000 | grep '<h1'`** returns the heading — proves the server/client split is right.
- Click Start on a **built** (`next build && next start`) bundle, not just dev. Renders-but-does-nothing = the `ssr: false` boundary is wrong.
- Page stays interactive *during* a running test (proves the Web Worker from Phase 3 is actually being used).
- No layout shift when the gauge mounts.
- Mobile viewport: no horizontal scroll, tap targets >= 44px.

## Done when

A full test runs on a deployed preview with correct numbers, server-rendered text present in raw HTML, and no layout shift.
