# Phase 3 — Measurement engine

**Goal:** Correct numbers. No UI. This phase is the product — everything after it is presentation.

**Prerequisites:** Phase 2 (needs a live Worker).

---

## Shape

`lib/speedtest/` — framework-agnostic TypeScript, **no React imports**, so it is unit-testable and reusable by the embed widget. Put it behind a `DataPlane` interface so the endpoint is swappable.

**Run it in a Web Worker.** Byte-counting six concurrent stream readers on the main thread blocks interaction and blows the <200 ms INP budget — on a page whose entire premise is measuring performance.

---

## Sequence

1. **Idle latency + jitter** — ~20 sequential `/ping` requests. Latency = **median** RTT (not mean — outliers are common). Jitter = mean absolute difference between consecutive RTTs.
2. **Download** — 6 parallel streams via `fetch` + `response.body.getReader()`, counting bytes per chunk. **Discard the first ~2s** (TCP slow start) and measure the remaining window. Restart any stream that finishes early. Start at 10 MB/stream, scale up adaptively on fast links.
3. **Loaded latency (down)** — `/ping` probes fired concurrently *during* step 2's saturation.
4. **Upload** — parallel `POST`s of a pre-generated random `Blob`. **Use `XMLHttpRequest`, not `fetch`** — `fetch` exposes no upload progress, so byte accounting is impossible with it. `xhr.upload.onprogress` is required.
5. **Loaded latency (up)** — probes during step 4.
6. **Derive** — bufferbloat grade and use-case verdicts.

Emit progress events throughout so Phase 4 can animate. Cache-bust every request with a nonce param and `cache: 'no-store'`.

---

## Bufferbloat grade

On added latency = `max(loadedDown, loadedUp) - idle` (Waveform scale):

| Grade | Added latency |
|---|---|
| A+ | < 5 ms |
| A | < 30 ms |
| B | < 60 ms |
| C | < 200 ms |
| D | < 400 ms |
| F | >= 400 ms |

## Use-case verdicts

Pure function over the result set:

| Use case | Threshold |
|---|---|
| 4K streaming | >= 25 Mbps down |
| HD video calls | >= 4 Mbps both ways, jitter < 30 ms, bufferbloat >= B |
| Competitive gaming | ping < 50 ms, bufferbloat >= A |
| WFH / large uploads | >= 10 Mbps up |

---

## Files

`lib/speedtest/{index,types,latency,download,upload,grade,verdicts}.ts` · `lib/speedtest/worker.ts`

---

## Verification

Drive it from a throwaway HTML page — **do not build UI to test this.**

- **Cross-validate:** run netgauge, fast.com and speed.cloudflare.com back to back on the same connection. Download/upload should agree **within ~10%**.
  - Way too high -> compression is on (Phase 2 #2).
  - Consistently low -> warm-up not discarded, or too few parallel streams.
  - Zero / NaN -> missing `Timing-Allow-Origin` (Phase 2 #4).
- **Throttled runs:** Chrome DevTools throttling (Fast 3G, Slow 4G). Reported speeds should track the imposed cap and the bufferbloat grade should visibly degrade.
- **Unit tests:** grading at every boundary (4/5, 29/30, 59/60, 199/200, 399/400 ms), jitter math, use-case verdicts.

## Done when

Numbers land within ~10% of fast.com and speed.cloudflare.com on the same line, across at least two different connections.
