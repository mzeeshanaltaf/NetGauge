# netgauge — Build Status

Tracks progress across sessions. **Read this first when starting a new session**, then open the phase doc you are working on.

Last updated: 2026-09-07 · Current phase: **Phase 3 — not started**

---

## Phases

| # | Phase | Doc | Status |
|---|---|---|---|
| 1 | Foundation | [docs/phase-1-foundation.md](docs/phase-1-foundation.md) | Done |
| 2 | Cloudflare Worker (data plane) | [docs/phase-2-worker.md](docs/phase-2-worker.md) | Done |
| 3 | Measurement engine | [docs/phase-3-engine.md](docs/phase-3-engine.md) | Not started |
| 4 | Test UI | [docs/phase-4-ui.md](docs/phase-4-ui.md) | Not started |
| 5 | Persistence & share links | [docs/phase-5-persistence.md](docs/phase-5-persistence.md) | Not started |
| 6 | Contact & Privacy | [docs/phase-6-contact-privacy.md](docs/phase-6-contact-privacy.md) | Not started |
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
| GitHub repo | Phase 1 | _not yet — local git repo only, no remote pushed_ |
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
