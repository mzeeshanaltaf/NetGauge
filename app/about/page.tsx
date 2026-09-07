import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://netgauge.zeeshanai.cloud";
const TITLE = "How netgauge Measures Your Speed | Methodology";
const DESCRIPTION =
  "See how netgauge measures your connection: six parallel streams, warm-up discard, adaptive sizing, and why loaded latency reveals bufferbloat other tests miss.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/about`, type: "website" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-16 pb-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          About netgauge
        </h1>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">
          A speed test built to answer a more useful question than &ldquo;how many
          megabits?&rdquo;
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Why netgauge exists</h2>
          <p>
            Most speed tests stop at download and upload numbers. netgauge also measures
            latency, jitter, and <strong>bufferbloat</strong> — the delay that shows up when
            your connection is fully loaded, which is what actually makes video calls
            stutter and games lag even on a &ldquo;fast&rdquo; line. Results are turned into
            plain verdicts for gaming, calls, and uploads, instead of a single number you
            have to interpret yourself.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">How it measures</h2>
          <p>
            Test traffic runs entirely on Cloudflare&rsquo;s global network of 300+
            locations, not on the server hosting this site. That means the bytes travel a
            short hop to whichever edge is closest to you, so the result reflects your own
            line rather than the distance to a single, distant data center. The app itself
            (this page, your history, share links) runs separately on Vercel — the two are
            deliberately split so that measuring your connection never depends on, or
            competes with, the app serving this page.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Methodology</h2>
          <p>
            Most speed tests publish a number without explaining how they got it. Here is
            exactly what netgauge does, in order:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Idle latency</strong> is measured first, before any download or upload
              traffic exists — 20 lightweight pings, reduced to a median (so a single slow
              ping can&rsquo;t skew the result) plus jitter, the average change between
              consecutive pings.
            </li>
            <li>
              <strong>Download and upload</strong> each run <strong>6 parallel streams</strong>{" "}
              for 8 seconds, after discarding the first 2 seconds of traffic. That warm-up
              window exists because TCP ramps up gradually (&ldquo;slow start&rdquo;) and
              your OS/browser haven&rsquo;t settled into steady state yet — measuring through
              it would understate your real speed. netgauge tracks byte counts on every
              chunk and interpolates the exact 2-second mark, rather than rounding to the
              nearest sample.
            </li>
            <li>
              <strong>Request size adapts to your connection.</strong> Each stream starts at
              10 MB per request and doubles (up to 200 MB) whenever a request finishes
              faster than 3 seconds — this keeps a gigabit line from being bottlenecked by
              per-request overhead, without over-requesting on a slower one.
            </li>
            <li>
              <strong>Loaded latency</strong> — the number behind the bufferbloat grade — is
              pinged every 200 ms while download and upload are saturating your connection,
              on a separate request that runs concurrently with the throughput streams.
              netgauge takes the higher of the loaded-download and loaded-upload latency,
              subtracts your idle latency, and grades the difference. See{" "}
              <Link href="/guides/what-is-bufferbloat" className="text-primary underline underline-offset-4">
                what bufferbloat is and why it matters
              </Link>{" "}
              for the full explanation.
            </li>
          </ul>
          <p>
            This is the same measurement approach used to compute the per-use-case verdicts
            (streaming, calls, gaming, uploads) shown with every result — they read directly
            off these numbers, not a separate heuristic.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">What we do with results</h2>
          <p>
            Your test history lives only in your browser. If you choose to save and share a
            result, it&rsquo;s stored without your raw IP address — see the{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-4">
              Privacy Policy
            </Link>{" "}
            for the full details on what&rsquo;s stored and what isn&rsquo;t.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Embed netgauge on your site</h2>
          <p>
            Drop this speed test on your own page — the test traffic runs on Cloudflare&rsquo;s edge, so
            embedding it costs your site nothing.
          </p>
          <pre className="mt-1 overflow-x-auto rounded-lg border border-border bg-muted px-4 py-3 text-xs">
            <code>{`<iframe
  src="https://netgauge.zeeshanai.cloud/embed"
  width="100%"
  height="720"
  style="border:0"
  title="netgauge speed test"
></iframe>`}</code>
          </pre>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Who built this</h2>
          <p>
            netgauge is built and maintained by{" "}
            <a
              href="https://zeeshanai.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Zeeshan Altaf
            </a>
            . Found a bug or have an idea?{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              Get in touch
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
