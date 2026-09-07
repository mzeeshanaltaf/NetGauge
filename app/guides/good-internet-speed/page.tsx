import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://netgauge.zeeshanai.cloud";
const TITLE = "What Is a Good Internet Speed? | netgauge";
const DESCRIPTION =
  "How many Mbps you actually need for streaming, video calls, gaming, and working from home, with real download and upload thresholds, not marketing numbers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/guides/good-internet-speed` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/guides/good-internet-speed`, type: "article" },
};

const USE_CASES: { label: string; needs: string; note: string }[] = [
  {
    label: "4K streaming",
    needs: "25 Mbps download",
    note: "Netflix, YouTube, and similar services recommend this floor per stream — double it if two people in the house stream 4K at once.",
  },
  {
    label: "HD video calls",
    needs: "4 Mbps down / 4 Mbps up, jitter under 30 ms",
    note: "Calls are symmetric — upload matters as much as download — and jittery latency causes the choppy audio and frozen video frames people blame on \"bad wifi.\"",
  },
  {
    label: "Competitive gaming",
    needs: "Idle latency under 50 ms, bufferbloat grade A or better",
    note: "Raw Mbps barely matters here. A 20 ms-ping gigabit line with bad bufferbloat will lag worse under load than a 100 Mbps line with a well-managed queue.",
  },
  {
    label: "WFH / large uploads",
    needs: "10 Mbps upload",
    note: "Cloud backups, large file transfers, and screen-sharing during calls all hinge on upload — the number most plans advertise the least prominently.",
  },
];

export default function GoodInternetSpeedGuide() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-16 pb-24">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "What Is a Good Internet Speed?", path: "/guides/good-internet-speed" },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        / <span className="text-foreground">What Is a Good Internet Speed?</span>
      </nav>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          What Is a Good Internet Speed?
        </h1>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">
          &ldquo;Good&rdquo; depends entirely on what you&rsquo;re doing with it — here are real thresholds, not a
          single magic number.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">There is no single good speed</h2>
          <p>
            ISPs sell speed as one number, but almost nothing you do online needs your full
            plan speed at once. A household streaming one 4K show needs 25 Mbps; the same
            household on a video call needs a fraction of that but is far more sensitive to
            latency and jitter. Buying more Mbps than your actual use case requires doesn&rsquo;t
            fix stutter or lag caused by <Link href="/guides/what-is-bufferbloat" className="text-primary underline underline-offset-4">bufferbloat</Link> —
            it just makes the bill bigger.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Thresholds by use case</h2>
          <p>These are the exact thresholds netgauge uses to grade your result pass/fail for each use case:</p>
          <div className="mt-1 flex flex-col divide-y divide-border rounded-lg border border-border">
            {USE_CASES.map((uc) => (
              <div key={uc.label} className="flex flex-col gap-1 px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-medium text-foreground">{uc.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{uc.needs}</span>
                </div>
                <p className="text-xs text-muted-foreground">{uc.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Multiple people, multiple devices</h2>
          <p>
            These thresholds are per activity, not per household — they stack. A household
            with one 4K stream, one video call, and a background cloud backup running at
            once needs roughly the sum of each: about 25 Mbps download for the stream, 4
            Mbps down / 4 Mbps up for the call, and 10 Mbps up for the backup, plus some
            headroom so none of them saturates the line and drags the others into
            bufferbloat.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Getting a number below your plan?</h2>
          <p>
            A gap between your plan speed and your test result is common and usually
            explainable — see{" "}
            <Link href="/guides/speed-slower-than-advertised" className="text-primary underline underline-offset-4">
              why your internet is slower than advertised
            </Link>{" "}
            for the most frequent causes.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">See how your connection stacks up</h2>
          <p>
            Run a test and netgauge will grade your result against each of these use cases
            automatically, alongside your bufferbloat grade.
          </p>
          <Link
            href="/"
            className="mt-1 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Test your connection →
          </Link>
        </section>
      </div>
    </div>
  );
}
