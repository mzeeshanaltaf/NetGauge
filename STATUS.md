# netgauge — Build Status

Tracks progress across sessions. **Read this first when starting a new session**, then open the phase doc you are working on.

Last updated: 2026-09-07 · Current phase: **Phase 7 — not started**

---

## Phases

| # | Phase | Doc | Status |
|---|---|---|---|
| 1 | Foundation | [docs/phase-1-foundation.md](docs/phase-1-foundation.md) | Done |
| 2 | Cloudflare Worker (data plane) | [docs/phase-2-worker.md](docs/phase-2-worker.md) | Done |
| 3 | Measurement engine | [docs/phase-3-engine.md](docs/phase-3-engine.md) | Done |
| 4 | Test UI | [docs/phase-4-ui.md](docs/phase-4-ui.md) | Done |
| 5 | Persistence & share links | [docs/phase-5-persistence.md](docs/phase-5-persistence.md) | Done |
| 6 | Contact & Privacy | [docs/phase-6-contact-privacy.md](docs/phase-6-contact-privacy.md) | Done |
| 7 | PWA, embed, rate limiting | [docs/phase-7-pwa-embed.md](docs/phase-7-pwa-embed.md) | Not started |
| 8 | SEO | [docs/phase-8-seo.md](docs/phase-8-seo.md) | Not started |
| 9 | Deploy & domain | [docs/phase-9-deploy.md](docs/phase-9-deploy.md) | Not started |

Status values: `Not started` · `In progress` · `Blocked` · `Done`

**Ordering:** 1 → 2 → 3 → 4 → 5 → 7 → 8 → 9. Phase 6 (Contact & Privacy) only needs Phase 1 and can be done any time.

---

## Values discovered during the build

Fill these in as phases complete — later phases need them.

| Value | Set in | Current |
|---|---|---|
| Worker URL (`NEXT_PUBLIC_WORKER_URL`) | Phase 2 | `https://netgauge-worker.zeeshanai.workers.dev` |
| Vercel DNS target (`<hash>.vercel-dns-017.com`) | Phase 9 | _not yet_ |
| GitHub repo | Phase 1 | `https://github.com/mzeeshanaltaf/NetGauge` |
| Vercel project | Phase 9 | _not yet_ |

---

## Session log

Append one entry per session: what was completed, what broke, what the next session should know.

### 2026-09-07 — Planning
Architecture decided and split into 9 phases. No code written yet.

Key decisions: data plane on a Cloudflare Worker (not Vercel, not the VPS); app on Vercel; results in the existing VPS Postgres under a new `netgauge` schema; full diagnostic suite including bufferbloat; share links `noindex`.

**First action in Phase 1: change `?schema=difflab` to `?schema=netgauge` in `.env.local`.**

### 2026-09-07 — Phase 1 complete
Scaffolded Next.js 15.5.25 (App Router, TypeScript, Tailwind v4, ESLint) via `create-next-app` into a temp dir and merged in, since the target directory already had `.env.local`/`CLAUDE.md`/`STATUS.md`/`docs/`. `shadcn@latest init` ran clean. Added `recharts`, `@prisma/client`, `nanoid`, `@upstash/redis`, `@upstash/ratelimit`, `@vercel/functions`.

Prisma 7.10.0 (stable; 8.x is still RC) with the `prisma-client` generator, `@prisma/adapter-pg` driver adapter, and `prisma.config.ts` (Prisma 7 moved datasource config out of `.env`-only into this file; it explicitly loads `.env.local` since Next's convention isn't Prisma's default). `multiSchema` is GA in Prisma 7, no preview flag needed. `Result` model created with `@@schema("netgauge")`; migration applied and verified directly against Postgres — `netgauge.results` exists, `difflab.diffs` untouched. Generated client output (`/generated`) is gitignored, not committed.

`.env.local` confirmed never tracked (`.env*` in `.gitignore` from the first commit). `IP_HASH_SALT` generated via `crypto.randomBytes(32)`.

Layout shell: root layout with `next/font` (Geist, subsetted), footer linking About/Contact/Privacy (pages don't exist yet — later phases), dark mode CSS variables from shadcn init (`.dark` class, no toggle wired up yet — that's Phase 4+). Placeholder homepage.

Verified: `tsc --noEmit` clean, `npm run dev` serves 200 with expected content, `prisma migrate status` clean.

**Next session: start Phase 2 (Cloudflare Worker).** No GitHub repo created yet — local commits only, on `main`.

### 2026-09-07 — Phase 2 complete and deployed
Built `worker/src/index.ts` with all four routes: `GET /ping` (204), `GET /download?bytes=N` (streamed via `ReadableStream.pull`, never buffered), `POST /upload` (drained via `request.body.pipeTo(new WritableStream())`, never buffered), `GET /meta` (ip/asn/asOrganization/colo/httpProtocol from `request.cf`).

Hit one runtime gotcha not in the doc: `crypto.getRandomValues()` at module scope throws `Disallowed operation called within global scope` under workerd — random generation, like fetch/setTimeout, is only allowed inside a handler. Fixed by lazily generating the 64 KB chunk on first request and caching it per-isolate (`getChunk()`), instead of at module load.

`Content-Encoding: identity`, `Cache-Control: no-store, no-transform`, and `Timing-Allow-Origin: *` are set on every response. CORS allowlist (`isAllowedOrigin`) covers `https://netgauge.zeeshanai.cloud`, `http://localhost:3000`, and any `*.vercel.app` preview; embed hosts get added in Phase 7. Rate limiting is **deliberately deferred to Phase 7** per the phase table — the doc's "Other notes" mentions it but "Done when" doesn't require it yet.

Verified locally against `wrangler dev` (all commands from the doc's Verification section): no `content-encoding: gzip`, `size_download` exact match at 1,000,000 bytes for a 1 MB request, `/meta` returns real ASN (9541) and colo (LHE), `/upload` returns 204 for a piped body, disallowed origins get no `Access-Control-Allow-Origin`, `OPTIONS` preflight returns 204 with the right CORS headers, bad `bytes` param returns 400, unknown routes return 404. `tsc --noEmit` clean.

**Deployed.** `wrangler login`/`wrangler deploy` needed an interactive browser OAuth flow this session couldn't drive, so the user ran `cd worker && npx wrangler deploy` themselves, chose the account-wide workers.dev subdomain `zeeshanai`, and got `https://netgauge-worker.zeeshanai.workers.dev`. Re-ran the full `curl` verification from the doc against that live URL: no `content-encoding: gzip`, exact 1,000,000-byte transfer, `/meta` returns real ASN (9541) and colo (LHE), `/upload` returns 204. `NEXT_PUBLIC_WORKER_URL` set in `.env.local`.

Also ran Cloudflare's official agent-setup (`https://developers.cloudflare.com/agent-setup/prompt.md`) at the user's request: `claude plugin marketplace add cloudflare/skills` + `claude plugin install cloudflare@cloudflare` (user scope) — installs Cloudflare skills and the Cloudflare MCP servers (docs/bindings/builds/observability) for future sessions. Needs `/reload-plugins` to activate; first Cloudflare MCP tool call will trigger its own browser OAuth. Unrelated to the Worker's own Cloudflare account auth above.

**Next session: start Phase 3 (measurement engine).**

### 2026-09-07 — Phase 3 complete
Built `lib/speedtest/{types,latency,download,upload,grade,verdicts,index,worker}.ts` per the doc. `DataPlane` interface (`ping`/`download`/`upload`) in `types.ts` keeps the engine testable and endpoint-swappable; `CloudflareDataPlane` (the concrete implementation wired to the Phase 2 Worker) lives in `index.ts` alongside `runSpeedTest`, the orchestrator that runs the full sequence and emits `SpeedTestProgress` events.

Key implementation choices not spelled out in the doc:
- **Warm-up discard** is exact, not approximate: `ThroughputSampler` (in `download.ts`, reused by `upload.ts`) records a `{t, cumulativeBytes}` sample on every chunk and linearly interpolates the byte count at exactly `warmupMs` before computing throughput over the remainder — handles chunk boundaries that don't land on the 2s mark.
- **Adaptive stream sizing**: each of the 6 parallel streams starts at `initialBytesPerStream` and doubles (capped at `maxBytesPerStream`) whenever a single request finishes faster than `requestTargetMs` (3s) — this is what "restart any stream that finishes early" and "scale up adaptively" cash out to concretely.
- **Loaded latency** runs via a separate `AbortController` that's started before `measureDownload`/`measureUpload` and aborted right after — probes fire back-to-back (not on a fixed timer) so they reflect real queueing delay under saturation.
- Upload's pre-generated `Blob` is generated once at `maxBytesPerStream` size and `.slice()`d per request, so scaling up never re-triggers `crypto.getRandomValues` (which caps at 65536 bytes/call).
- `worker.ts` (the Web Worker entry point) types the global scope through a narrow local `WorkerGlobalScope` interface instead of a triple-slash `webworker` lib reference — the project's `tsconfig.json` targets `dom` lib for the main thread, and mixing `dom` + `webworker` lib refs in one program produces global type conflicts.

**Also fixed, pre-existing from Phase 1/2:** root `tsconfig.json` had no `exclude` for `worker/`, so `tsc --noEmit` at the repo root was failing on Cloudflare-Workers-only globals (`ExecutionContext`, `request.cf`, etc.) that only resolve under `worker/tsconfig.json`'s `@cloudflare/workers-types`. Added `"worker"` to the root `exclude` array — the two are separate TS projects with separate deploy pipelines and always were.

**Testing added:** `vitest` (devDependency; `npm test`). `vitest.config.ts` sets `css.postcss.plugins: []` — without it, Vite's config loader chokes on this project's Tailwind v4 `postcss.config.mjs` (`plugins: ["@tailwindcss/postcss"]` is a Next-specific shorthand Vite's postcss loader can't resolve on its own). 31 tests across `grade.test.ts` (every boundary from the doc: 4/5, 29/30, 59/60, 199/200, 399/400ms), `latency.test.ts` (median + jitter math, including the outlier-resistance case), and `verdicts.test.ts` (all four use cases, boundary and negative cases) — all passing.

**Verified live against the deployed Worker** (`https://netgauge-worker.zeeshanai.workers.dev`) via a throwaway Node script (`tsx`, deleted after use): `/download?bytes=1000000` returns exactly 1,000,000 bytes with `content-encoding: identity` and `Timing-Allow-Origin: *` present; `measureIdleLatency` returns plausible RTTs (~30ms median this session); `measureDownload` + `measureLoadedLatency` run concurrently and show the expected bufferbloat signature (idle ~30ms RTT rising to 50-150ms under saturation). This exercises `CloudflareDataPlane.ping`/`.download`, `ThroughputSampler`, the warm-up discard, and the restart-on-finish/adaptive-sizing loop against the real network — the highest-risk logic in the phase.

**Browser verification (upload path + full sequence) done by the user**, via a throwaway harness (bundled with `esbuild`, served with `npx serve` on `http://localhost:3000` — required to match the Worker's CORS allowlist — from the session's scratchpad directory, never added to the repo) that ran the full `runSpeedTest()` sequence including the XHR-based upload, which doesn't exist in Node and so couldn't be exercised by the earlier Node smoke test. Confirmed working. The harness process was stopped and the scratchpad files were never committed — nothing to clean up in the repo.

**Phase 3 done.** GitHub remote now exists (`https://github.com/mzeeshanaltaf/NetGauge`) and this phase's work was pushed to it.

**Next session: start Phase 4 (Test UI)** — this is what actually wires `lib/speedtest/worker.ts` into a `new Worker(...)` from a client component, per the "homepage is a split render" rule in `CLAUDE.md`.

### 2026-09-07 — Phase 4 complete

Built the full test UI per `docs/phase-4-ui.md`, run through the `/design-taste-frontend` skill to keep it off the generic-AI-tool aesthetic. Design read: a network diagnostic instrument for technically-minded users (not a marketing landing page), so `VISUAL_DENSITY` leans toward "daily app" for the results/ISP panel and stays airy around the hero. One accent color throughout (`--primary`/`--chart-1`, a blue, oklch hue 235) plus a second functional color (`--chart-2`, teal) used only to distinguish download vs upload; three semantic grade colors (`--grade-good/mid/bad`) used only for the bufferbloat badge and verdict check/x icons. Geist Mono on every numeric readout (gauge, result numbers, IP/ASN, latency) for an instrument feel. Native `<details>` FAQ (crawlable, zero JS) instead of a JS accordion.

**The `ssr:false` boundary needed an extra layer not in the doc:** Next.js App Router refuses `ssr: false` on `next/dynamic` called directly inside a Server Component (`app/page.tsx`) — it throws at build time, not silently. Fixed by adding `components/speed-test-loader.tsx`, a `"use client"` wrapper that owns the `dynamic(..., {ssr:false})` call; `page.tsx` just imports and renders that. This is the CLAUDE.md guideline's own example pattern, just split into two files instead of one.

**Web Worker wiring:** `hooks/use-speed-test.ts` owns the worker lifecycle (`new Worker(new URL("../lib/speedtest/worker.ts", import.meta.url))`, terminated on unmount and on re-start). It does NOT use the engine's own per-phase `elapsedMs` for the live chart's x-axis — that resets to 0 at the start of both `measureDownload` and `measureUpload`, which would overlap both series at x=0. Instead it stamps every progress event with `performance.now() - testStartRef.current` on the main thread, giving one continuous timeline across ping → download → upload. `LiveChart` renders download/upload as two `<Area>` series with independent `data` arrays sharing one numeric x-axis (a real Recharts v3 feature, avoids manually merging two time-indexed arrays).

**CLS fix:** `components/speed-test-skeleton.tsx` mirrors the loaded widget's real box model (same `h-52 w-64` gauge circle, `h-11` button, `h-36` chart, same cluster padding in the ISP panel) so the skeleton-to-real-widget swap doesn't shift the page — verified by measuring the Start button's bounding box before and after the swap in a Playwright script (identical `{x,y,width,height}`).

**Found and fixed a pre-existing Phase 1 bug, unrelated to this phase's own work but directly visible in it:** `app/globals.css` had `--font-sans: var(--font-sans);` (self-referential, invalid) inside `@theme inline`, and separately `html { @apply font-sans; }` — but next/font's actual `--font-geist-sans` variable is only defined on `<body>` (via `geistSans.variable`), which `<html>` (body's ancestor) can never see, since CSS custom properties only inherit downward. Net effect: the whole site was silently rendering in the browser's UA default serif font (visible in a screenshot, not in `tsc`/`eslint`/`next build`, all of which stayed clean throughout). Fixed by pointing `--font-sans` at `--font-geist-sans` and moving the `font-sans` class onto `<body>` itself; removed the now-dead `html { @apply font-sans; }` rule.

**Verified:** `tsc --noEmit` and `eslint` clean; `npm test` still 31/31; `next build --turbopack` succeeds. Ran the doc's own checklist against a built (`next build && next start`) instance via a throwaway Playwright script (installed to the session scratchpad only, not the repo): `curl localhost:3000 | grep '<h1'` returns the heading; a full test runs end-to-end against the live Worker (real result: 18.6 Mbps down / 13.6 Mbps up / 20ms idle ping / grade C bufferbloat, +69ms added latency); zero console errors; no layout shift on the ssr:false swap; mobile viewport (375px) has no horizontal scroll and the Start button measures exactly 44px tall.

**One environment note for future sessions:** found and killed a stale `node` process already bound to port 3000 at the start of this session, serving old placeholder content unrelated to the current app (likely a leftover from Phase 3's `npx serve` harness despite the Phase 3 log claiming it was stopped). Worth a quick `Get-NetTCPConnection -LocalPort 3000` check if `next start`/`next dev` ever refuses to bind.

**Not done in this phase (by design, deferred to later phases per the phase table):** no dark-mode toggle (system `prefers-color-scheme` only — Phase 4's doc didn't ask for one); no persistence of results (Phase 5); no rate limiting on the widget (Phase 7).

**Next session: start Phase 5 (Persistence & share links).**

### 2026-09-07 — Phase 5 complete
Built `lib/hash.ts` (sha256 IP hash), `lib/ratelimit.ts` (Upstash sliding window, 5/60s, `Redis.fromEnv()`), `app/api/results/route.ts` (hand-rolled validation — no zod dependency — rate-limits by `ipAddress(request)` from `@vercel/functions`, hashes it, inserts via `db.result.create`, never stores the raw IP), `app/r/[id]/page.tsx` + `app/r/[id]/opengraph-image.tsx` (`noindex, follow`; `next/og`'s built-in `ImageResponse`, no `@vercel/og` package needed), `lib/history.ts` + `components/history.tsx` (localStorage, last 20, CSV/JSON export, trend chart).

**Refactored the ISP panel's data fetching out from under it**, since Phase 5 needs the same worker-`/meta` + `/api/geo` data for DB submission that Phase 4's `IspPanel` already fetched for display — duplicating the fetch would mean two independent round trips per test. Added `hooks/use-network-meta.ts` (the fetch logic, moved verbatim out of `isp-panel.tsx`) and made `IspPanel` a pure props-in component; `speed-test.tsx` now calls the hook once and feeds both `IspPanel` and the new `hooks/use-result-submission.ts`.

**The share page reuses `ResultCard` directly, unmodified.** It has no `"use client"` directive and only reads `.latencyMs`/`.jitterMs`/`.mbps` off its props — never `.samples` — so a `SpeedTestResult`-shaped object reconstructed from the DB row (empty `samples: []`, dummy `bytesTransferred`/`durationMs` since the card never reads them) renders identically server-side. `addedLatencyMs` isn't a DB column — recomputed on read as `max(loadedDownMs, loadedUpMs) - idleMs`, matching the exact formula in `lib/speedtest/index.ts`. Verdicts aren't stored either — recomputed via the same `computeVerdicts()` the live test uses, from the four stored raw numbers.

**`app/robots.ts`/`app/sitemap.ts` deliberately not created here** — `docs/phase-8-seo.md` explicitly owns both files and phase 5's file list doesn't include them; only the page-level `noindex, follow` metadata was in scope now.

**Added `metadataBase` to the root layout** (`app/layout.tsx`), reading `NEXT_PUBLIC_SITE_URL` — without it, Next can't resolve the file-convention OG image to the absolute URL the doc requires; confirmed via curl that `og:image` renders as `https://netgauge.zeeshanai.cloud/r/<id>/opengraph-image?...`, not a relative path.

**Verified against the live VPS Postgres, not mocks:** POST a real payload → row lands in `netgauge.results` with `ipHash` as a 64-char hex digest (confirmed `!== raw IP`); hammered the endpoint 7x in a row → first 4 succeed (201), rest 429; malformed grade/missing fields get 400 (once outside the rate-limit window); `/r/<id>` for a real id renders the full result card + verdicts + `<meta name="robots" content="noindex, follow">` (curl, no browser/localStorage involved); unknown id → 404 via `notFound()`; opengraph-image route returns a real 1200×630 PNG (fetched and visually inspected — download/upload numbers, colored grade badge, and the "Test your connection →" CTA all render correctly). All test rows deleted after verification; `netgauge.results` is empty again.

**Build gotcha, not a real bug:** an incremental `next build --turbopack` on top of a stale `.next/` from an earlier phase produced a build that compiled clean and printed the full route table, but silently wrote an incomplete `app-paths-manifest.json` (missing every route added this session) — `next start` against it 404'd on `/api/results` and `/r/[id]`. A clean `rm -rf .next && next build --turbopack` fixed it immediately and reproduced correctly twice. Worth an `rm -rf .next` if a freshly-built route ever 404s under `next start` but works under `next dev`.

**Also killed a second stale leftover `node` process bound to port 3000** at the start of this session (returning 500 on every route) — same class of issue Phase 4's log already flagged; not this session's own doing.

`tsc --noEmit`, `eslint` (0 new issues — the only lint error is pre-existing in `worker/src/index.ts`, unrelated to this phase), and `npm test` (31/31, unchanged) all clean. `next build --turbopack` succeeds with the new routes listed.

**Next session: start Phase 6 (Contact & Privacy)** — Phase 7 (PWA/embed/rate limiting) and Phase 8 (SEO) are still blocked on it per the phase table's ordering note.

### 2026-09-07 — Phase 6 complete
Used the `nextjs-contact-form` skill, which already targets the exact env var names in `.env.local` (`N8N_CONTACT_WEBHOOK_URL`, `N8N_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) — no renaming needed. Added `lib/rate-limit.ts` as its own Upstash sliding-window limiter (5/10min, `netgauge:ratelimit:contact` prefix) separate from Phase 5's `lib/ratelimit.ts` (5/60s, `netgauge:ratelimit:results`) since the two endpoints have different abuse profiles; it fails open (allows the request) if Upstash env vars are absent, so a misconfigured env never hard-breaks the form.

`app/api/contact/route.ts` accepts both JSON (fetch path) and `application/x-www-form-urlencoded` (native no-JS fallback), returns **303** redirects for the form-post path so the browser re-fetches with GET instead of re-POSTing, and pretends success on a tripped honeypot (`hp_field`) so bots get no signal. `components/contact-form.tsx` keeps the dual `action="/api/contact" method="post"` + `onSubmit` wiring from the skill's progressive-enhancement pattern intact, restyled with the project's actual shadcn primitives (`Input`/`Textarea`/`Label`/`Button` — added via `npx shadcn@latest add input textarea label`, matching the existing `base-nova`/Base UI style) instead of the skill's raw-Tailwind baseline, and uses the project's `--primary`/`--destructive` tokens instead of hardcoded emerald/red.

`app/privacy/page.tsx` describes the real data flow read out of `prisma/schema.prisma` and `app/api/results/route.ts` — every completed test (not just shared ones) is persisted with a salted SHA-256 IP hash plus ISP/ASN/city/country, share links are public to anyone with the URL, local history is `localStorage`-only, and the four processors (Vercel, Cloudflare, Upstash, self-hosted n8n) are named with what each one actually handles. Deletion is by share-link ID via `/contact`, since no direct identifier is stored to look results up by requester.

Also added the footer developer credit ("Developed with 💖 by Zeeshan Altaf", linking to `https://zeeshanai.cloud`) per this session's explicit request — not part of the phase doc.

**Verified live, not mocked:** a real POST reached the n8n webhook and returned 200 (4s round trip, confirming the workflow is active — an inactive one would 404); the honeypot field silently returns `{success:true}` without calling the webhook; 6 rapid requests hit `429` after the 5th (Upstash sliding window confirmed live, not just fail-open); the native urlencoded POST path returns a real `303` to `/contact?error=rate`. `next build --turbopack` succeeds with `/contact` (dynamic) and `/privacy` (static) both listed.

**Next session: start Phase 7 (PWA, embed, rate limiting).**
