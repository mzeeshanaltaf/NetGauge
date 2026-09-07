# Phase 8 — SEO

**Goal:** The site is crawlable, fast, and has content worth ranking. Derived from the `seo-audit` skill, applied as build requirements rather than an audit.

**Prerequisites:** Phases 4–7 (needs the real pages to exist).

---

## 1. Indexation — the decision that matters most

**`/r/[id]` result pages are `noindex, follow` and excluded from the sitemap.** They are potentially thousands of near-identical, user-generated pages ("847 Mbps / 112 Mbps / grade A") — textbook thin duplicate content at scale. The helpful-content system is **site-wide**, so letting them index would drag down the pages that should rank.

They stay **server-rendered** regardless, because that is what makes OG cards unfurl. Rendering and indexing are separate concerns; conflating them is the trap here.

Same treatment for `/embed` (thin duplicate of the homepage) and `/api/*`.

- `app/robots.ts` — allow the site; disallow `/api/`, `/embed`, `/r/`; reference the sitemap absolutely.
- `app/sitemap.ts` — **static pages only**: `/`, `/about`, `/contact`, `/privacy`, each `/guides/[slug]`. No result URLs.
- Self-referencing canonical on every indexable page via `metadata.alternates.canonical`.
- Consistent host and trailing-slash convention; URLs lowercase and hyphenated.

**International SEO is deliberately out of scope.** Single-locale (`en`) site: no hreflang, no `x-default`, no locale prefixes. Set `<html lang="en">` and stop. Adding hreflang for one locale creates errors with no upside.

## 2. On-page

- **Titles 50–60 chars, unique per page.** e.g. `Internet Speed Test - Download, Upload & Bufferbloat | netgauge`
- **Meta descriptions 150–160 chars, unique per page — count the characters, do not eyeball.** A brand suffix appended by a template is the usual cause of overflow, so verify the **rendered** tag, not the source constant.
- One `<h1>` per page; logical `h2`/`h3` beneath; headings describe content rather than style it.
- **OG images 1200×630** via `@vercel/og`, with `og:image:alt` and absolute URLs from `NEXT_PUBLIC_SITE_URL`. The card must carry a **call to action**, not just branding.
- Images: descriptive filenames, alt text, WebP via `next/image`, lazy loading below the fold.
- Footer links to About / Contact / Privacy / guides; guides cross-link to the test. No orphan pages.

## 3. Core Web Vitals

Non-negotiable on a tool that measures connection performance — being slow here is self-refuting. **LCP <2.5s, INP <200ms, CLS <0.1.** Already addressed structurally: the server/client split and fixed-height gauge placeholder (Phase 4) and the Web Worker engine (Phase 3). Subset the font via `next/font` to avoid shift on swap.

## 4. Structured data

JSON-LD in the server-rendered layout: `WebApplication` for the tool, `FAQPage` for the homepage FAQ, `BreadcrumbList` on guides.

**Validate with Google's Rich Results Test, not `curl`** — `curl` and fetch-based tools cannot see JSON-LD reliably.

## 5. Content — the real ranking work

A bare speed test is thin content competing with Ookla and Netflix, and will lose. The differentiator built into this app *is* the content angle: **nobody explains bufferbloat well.** One keyword per page, no cannibalisation:

| Page | Target keyword |
|---|---|
| `/` | internet speed test |
| `/about` | methodology — how the measurement actually works |
| `/guides/what-is-bufferbloat` | what is bufferbloat |
| `/guides/good-internet-speed` | what is a good internet speed |
| `/guides/speed-slower-than-advertised` | why is my internet slower than advertised |

**E-E-A-T:** the methodology page is the strongest asset — a first-hand, original explanation of the measurement (stream counts, warm-up discard, why loaded latency matters) that almost no competitor publishes. HTTPS, a real contact route and a real privacy policy cover the trust signals (Phase 6).

---

## Verification

- **Indexation:** `curl` a result page → `noindex` present. `/r/` and `/embed` absent from `/sitemap.xml` and disallowed in `/robots.txt`. Confirm the OG card **still unfurls** despite `noindex` — that combination is intended and worth eyeballing because it looks wrong.
- **Metadata lengths:** script a check over every indexable route asserting title ≤60 and description ≤160 chars against the **rendered** HTML.
- **Canonicals:** every indexable page self-canonicals to its `https://netgauge.zeeshanai.cloud/...` URL; nothing canonicals to the homepage.
- **Structured data:** validate `/` and one guide in the Rich Results Test.
- **Core Web Vitals:** PageSpeed Insights on the deployed homepage. Confirm no shift when the gauge mounts, and that the page stays interactive *during* a running test.
- **Server-rendered content:** `curl` the homepage → H1 and FAQ text present in raw HTML. An empty shell means the Phase 4 split is wrong and the page cannot rank.

## Done when

Robots/sitemap/canonicals correct, result pages excluded, all metadata within limits, Core Web Vitals green, and five content pages published.
