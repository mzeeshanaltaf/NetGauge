# Phase 5 — Persistence & share links

**Goal:** Every test gets a permanent shareable URL with an OG card. Local history with a trend chart.

**Prerequisites:** Phase 1 (Prisma), Phase 4 (results to save).

---

## Storage

Direct Prisma connection to the VPS Postgres — no intermediate API service, since `DATABASE_URL` already provides one. `connection_limit=1` in the URL is what keeps this safe under serverless concurrency; do not remove it.

`POST /api/results` — validate, rate-limit with Upstash, insert, return the short id.
`GET /r/[id]` — server-rendered result page.

**Privacy — non-negotiable:** store `sha256(ip + IP_HASH_SALT)`, **never the raw IP**. The user sees their own IP client-side; it is not persisted. City, country, ISP and ASN are stored; they are coarse enough not to identify a person.

Local history lives in `localStorage` (last ~20 tests + trend chart), independent of the database. Export to CSV/JSON.

---

## Share cards

`app/r/[id]/opengraph-image.tsx` using `@vercel/og`. **1200x630.** Include:
- the measured numbers (inherently compelling — this is the share hook)
- a **call to action**: "Test your connection ->"
- `og:image:alt`, absolute URL built from `NEXT_PUBLIC_SITE_URL`
- type large enough to read as a feed thumbnail

---

## Important: these pages are `noindex`

`/r/[id]` pages are server-rendered **but not indexed** — thousands of near-identical pages would be thin duplicate content and drag down the whole site (Phase 8 covers the reasoning). Rendering and indexing are separate concerns:

- **Server-rendered** so OG cards unfurl in social and chat. Required.
- **`noindex, follow`** in metadata, excluded from the sitemap, disallowed in robots.

That combination looks contradictory but is correct.

---

## Files

`app/api/results/route.ts` · `app/r/[id]/page.tsx` · `app/r/[id]/opengraph-image.tsx` · `lib/{db,ratelimit,hash}.ts` · `components/history.tsx`

---

## Verification

- Run a test -> row appears in `netgauge.results`; **confirm `ipHash` is a hash, not an IP**.
- Open `/r/[id]` in a clean browser (no localStorage) -> renders correctly server-side.
- Validate the OG card in a social preview debugger; confirm it unfurls **despite** the `noindex`.
- Hammer `/api/results` -> Upstash returns 429.
- `\dt difflab.*` still unchanged.

## Done when

Results persist to the `netgauge` schema with hashed IPs, share links render for strangers, and OG cards unfurl.
