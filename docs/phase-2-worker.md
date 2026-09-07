# Phase 2 — Cloudflare Worker (data plane)

**Goal:** A deployed Worker that serves the test bytes. All measurement traffic lives here, never on Vercel or the VPS.

**Prerequisites:** Phase 1. Needs a Cloudflare account (free tier).

**Why this exists:** a speed test is a bandwidth application. On Vercel the bytes would cost ~1-4c/test after 1 TB. On the VPS they would fight 18 co-tenant apps for 2 vCPUs and, being one datacenter, would measure the undersea path for distant users rather than their line. Cloudflare's 300+ PoPs solve both, free.

---

## Routes

| Route | Behaviour |
|---|---|
| `GET /ping` | Empty `204`. Latency/jitter probe. |
| `GET /download?bytes=N&i=<nonce>` | Streams N bytes of incompressible data. |
| `POST /upload` | Drains and discards the body, returns `204`. |
| `GET /meta` | `{ ip, asn, asOrganization, colo, httpProtocol }` from `request.cf`. |

---

## Five things that will silently break this

1. **Do not buffer the response.** Build a `ReadableStream` and enqueue a pre-generated chunk repeatedly until N bytes are sent. Building a full N-byte buffer blows the 10 ms CPU limit.
2. **Defeat compression.** A repeated chunk compresses to almost nothing and would report absurd gigabit speeds. Send `Content-Type: application/octet-stream`, `Content-Encoding: identity`, `Cache-Control: no-store, no-transform`.
3. **`crypto.getRandomValues` caps at 65536 bytes per call.** Generate one 64 KB chunk at module scope and reuse it.
4. **`Timing-Allow-Origin: *` on every response.** Without it `PerformanceResourceTiming` returns *zeroed* timings cross-origin and measurement silently reads 0. Costs one header, causes hours of debugging when missed.
5. **CORS** allowlist for the Vercel domain plus embed hosts.

---

## Other notes

- Free tier is **100k requests/day**. A full test is ~40-60 requests, so ~2,000 tests/day. Upgrade path is $5/mo for 10M/month.
- Add a per-IP rate limit using Cloudflare's rate-limiting binding — the embeddable widget (Phase 7) means strangers can trigger tests.
- `request.cf` on the **free** tier exposes `asn` and `colo` but **not** `city`/`country`. Do not build the ISP panel around fields that will be undefined; city/country come from Vercel in Phase 4.

---

## Files

`worker/src/index.ts` · `worker/wrangler.toml` · `worker/package.json`

Deploy with `npx wrangler deploy`. Then add to `.env.local`:
```
NEXT_PUBLIC_WORKER_URL=https://<worker>.workers.dev
```

---

## Verification

```bash
# No gzip in the response headers
curl -sI '<worker>/download?bytes=1000000' | grep -i content-encoding

# Full byte count actually transferred
curl -s -o /dev/null -w '%{size_download}\n' '<worker>/download?bytes=1000000'   # -> 1000000

# Meta returns real ASN + colo
curl -s '<worker>/meta'

# Upload accepts a body
curl -s -o /dev/null -w '%{http_code}\n' -X POST --data-binary @/dev/urandom '<worker>/upload'
```

If `size_download` is far below the requested bytes, compression is on — fix #2 above.

## Done when

All four routes respond correctly, a 25 MB download transfers 25 MB uncompressed, and `Timing-Allow-Origin` is present on every route.
