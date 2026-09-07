# Phase 9 — Deploy & domain

**Goal:** Live at `https://netgauge.zeeshanai.cloud`, verified in Search Console.

**Prerequisites:** All previous phases.

---

## 1. Deploy to Vercel

Push to GitHub, import into Vercel. Copy every var from `.env.local` into Vercel project settings:

`DATABASE_URL` (with **`?schema=netgauge`**) · `NEXT_PUBLIC_WORKER_URL` · `NEXT_PUBLIC_SITE_URL` · `IP_HASH_SALT` · `N8N_CONTACT_WEBHOOK_URL` · `N8N_API_KEY` · `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN`

## 2. Domain — ordering matters

Existing DNS pattern on `zeeshanai.cloud`: **Vercel apps use CNAME** (`randpass`, `todo`, `difflab` → `<hash>.vercel-dns-017.com`, TTL 14400); **VPS apps use A** → `76.13.7.106`, TTL 300. This is a Vercel app, so CNAME.

1. Add `netgauge.zeeshanai.cloud` as a domain in the Vercel project.
2. Vercel returns a **project-specific** target like `<hash>.vercel-dns-017.com`. **This hash cannot be known in advance** — the DNS record must be created *after* the domain is added, never before.
3. Create the record via the Hostinger DNS MCP (`DNS_updateDNSRecordsV1`): type `CNAME`, name `netgauge`, content the Vercel target, TTL `14400`.
4. Wait for verification and confirm SSL is issued.

## 3. Post-domain wiring

- Set `NEXT_PUBLIC_SITE_URL=https://netgauge.zeeshanai.cloud` in Vercel and redeploy.
- **Update the Worker's CORS allowlist to the final domain** — easy to forget, and the symptom is a test that hangs at 0 Mbps in production while working fine on the preview URL.

## 4. Search Console

`netgauge.zeeshanai.cloud` is a **separate property** from `zeeshanai.cloud` — the existing root `google-site-verification` TXT record **does not cover it**. Verify it on its own (DNS TXT or the Vercel-served HTML file), then submit `/sitemap.xml`.

---

## Verification

- `dig netgauge.zeeshanai.cloud` resolves to the Vercel target; HTTPS loads with a valid certificate.
- **Run a full test on the production domain** — this is the CORS check. If it hangs at 0, step 3 was missed.
- Contact form submits and reaches n8n from production.
- Result share link opens in a clean browser; OG card unfurls.
- PageSpeed Insights on the live URL: LCP <2.5s, INP <200ms, CLS <0.1.
- Search Console property verified, sitemap submitted and accepted.
- Confirm the VPS is unaffected: CPU still ~13.5% baseline during a test, and `\dt difflab.*` unchanged. The whole architecture exists so test traffic never touches that box.

## Done when

Live on the custom domain with valid SSL, a full test runs in production, and the Search Console property is verified with the sitemap accepted.
