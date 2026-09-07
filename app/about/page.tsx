import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — netgauge",
  description:
    "Why netgauge exists, how it measures your connection, and the architecture behind it.",
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
