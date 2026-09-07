# Phase 7 — PWA, embed widget, rate limiting

**Goal:** Installable app, embeddable widget, and abuse protection before the site is public.

**Prerequisites:** Phases 4 and 5.

---

## PWA

`app/manifest.ts` + icons + a service worker caching **the app shell only**.

**Never cache the test endpoints.** A cached `/download` response would return instantly from disk and report a fake multi-gigabit result. Explicitly exclude the Worker origin from the service worker's fetch handler.

---

## Embed widget

`/embed` — chrome-less version of the test for `<iframe>` use by other sites. Free distribution and backlinks; the bandwidth lands on the Cloudflare Worker, so third-party embeds cost nothing.

- Reuses the Phase 3 engine directly (it has no React dependency, which is why it was built that way).
- Add the embed hosts to the Worker's CORS allowlist.
- Provide a copy-paste snippet on the About page.
- **`noindex`** — it is a thin duplicate of the homepage.

---

## Rate limiting — two separate layers

These protect different things and both are needed:

| Layer | Protects | Mechanism |
|---|---|---|
| **Cloudflare Worker** | Bandwidth / the 100k req/day free tier | CF rate-limiting binding, per IP |
| **Vercel `/api/results`, `/api/contact`** | Database writes, n8n spam | Upstash Redis, per IP |

The widget means strangers on unknown sites can trigger tests, so the Worker-side limit is the one that actually caps exposure.

---

## Files

`app/manifest.ts` · `app/embed/page.tsx` · `public/sw.js` · `public/icons/*` · `lib/ratelimit.ts` (extend)

---

## Verification

- Lighthouse PWA audit passes; app installs on mobile.
- **Run a test twice offline-capable:** confirm the second run still hits the network and does not return a cached, absurdly fast result. This is the main PWA risk.
- Embed the iframe on a different local origin -> works, and CORS does not block it.
- Exceed the Worker rate limit -> 429, and the UI shows a readable message rather than hanging.

## Done when

App installs, embed works cross-origin, both rate limits trigger, and no test endpoint is ever served from cache.
