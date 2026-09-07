# Phase 6 — Contact & Privacy pages

**Goal:** Working contact form and an honest privacy policy. Both are also E-E-A-T trust signals that Phase 8 depends on.

**Prerequisites:** Phase 1. Independent of Phases 2-5 — can be built in parallel.

---

## Contact page

**Use the `nextjs-contact-form` skill.** It matches the available env vars exactly: a Name/Email/Message form posting to an n8n webhook with an `x-api-key` header, protected by a non-descriptive honeypot field and per-IP Upstash rate limiting, using progressive enhancement so it still works if hydration fails.

Env vars already in `.env.local` — **map the skill's expected names onto these rather than renaming what exists:**

| Purpose | Variable |
|---|---|
| Webhook target | `N8N_CONTACT_WEBHOOK_URL` |
| Auth header value (`x-api-key`) | `N8N_API_KEY` |
| Rate limit store | `UPSTASH_REDIS_REST_URL` |
| Rate limit token | `UPSTASH_REDIS_REST_TOKEN` |

**Confirm the n8n workflow at that webhook ID is active before testing** — an inactive workflow returns 404 and looks like a code bug.

---

## Privacy policy

Must describe what the app actually does, not boilerplate. Cover:

- Results are stored with a **salted hash** of the IP — the raw address is never persisted.
- ISP, ASN, city and country are stored alongside each result.
- Local test history stays in the browser (`localStorage`) and is never uploaded.
- **Share links are public to anyone holding the URL.** Say this plainly — users are publishing when they share.
- Processors involved: **Vercel** (hosting, geo headers), **Cloudflare** (test traffic), **Upstash** (rate limiting), **self-hosted n8n** (contact form).
- Retention period, and how to request deletion — link to `/contact`.

Link both pages from the footer.

---

## Files

`app/contact/page.tsx` · `app/api/contact/route.ts` · `app/privacy/page.tsx` · `components/contact-form.tsx`

---

## Verification

- Submit the form -> the n8n workflow receives it.
- Submit repeatedly -> Upstash returns 429.
- Fill the honeypot field -> silently rejected, no webhook call.
- **Disable JavaScript and submit** -> still posts (this is the whole point of progressive enhancement).
- Privacy page renders and is linked from the footer on every page.

## Done when

Contact submissions reach n8n, all three abuse paths are covered, and the privacy policy accurately describes the real data flow.
