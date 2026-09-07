import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://netgauge.zeeshanai.cloud";
const TITLE = "What Is Bufferbloat? Causes & Fixes | netgauge";
const DESCRIPTION =
  "Bufferbloat is the hidden delay that makes video calls stutter and games lag even on a fast connection. Learn what causes it and how netgauge measures it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/guides/what-is-bufferbloat` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/guides/what-is-bufferbloat`, type: "article" },
};

const GRADE_ROWS: [string, string, string][] = [
  ["A+", "< 5 ms", "No perceptible bufferbloat"],
  ["A", "< 30 ms", "Safe for competitive gaming"],
  ["B", "< 60 ms", "Fine for calls and casual gaming"],
  ["C", "< 200 ms", "Noticeable stutter under load"],
  ["D", "< 400 ms", "Calls and games will suffer"],
  ["F", "≥ 400 ms", "Severe — connection is unusable while loaded"],
];

export default function BufferbloatGuide() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-16 pb-24">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "What Is Bufferbloat?", path: "/guides/what-is-bufferbloat" },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        / <span className="text-foreground">What Is Bufferbloat?</span>
      </nav>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">What Is Bufferbloat?</h1>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">
          The connection problem that doesn&rsquo;t show up in a plain download/upload number.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">The short version</h2>
          <p>
            Bufferbloat is delay caused by oversized buffers in your router, modem, or ISP
            equipment queuing up data instead of dropping it when your connection is busy.
            Routers are supposed to buffer a little traffic to smooth out bursts — but many
            ship with buffers sized for a much faster line than the one they&rsquo;re
            actually serving, so under load those buffers fill up and every packet waits in
            a long line before it&rsquo;s sent. A connection with 20 ms of idle latency can
            spike into the hundreds of milliseconds the moment a large download or upload
            starts, even though the download itself is running at full speed.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Why it matters more than raw speed</h2>
          <p>
            Throughput and latency measure different things. A gigabit connection with bad
            bufferbloat will still download a file quickly, but a video call running
            alongside that download will stutter, a competitive game will lag, and a voice
            call will start cutting out — because every packet for those real-time
            applications is stuck behind a queue of download traffic. This is why two
            connections with identical Mbps numbers can feel completely different in
            practice: one has small, well-managed buffers, the other doesn&rsquo;t.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">How netgauge measures it</h2>
          <p>
            netgauge records your <strong>idle latency</strong> before any test traffic
            exists, then re-measures latency continuously while download and upload are
            fully saturating your connection (<strong>loaded latency</strong>). The
            difference between the two — how much extra delay shows up specifically because
            your line is busy — is the <strong>added latency</strong>, and it&rsquo;s what
            gets graded:
          </p>
          <div className="mt-1 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Grade</th>
                  <th className="px-3 py-2 font-medium">Added latency</th>
                  <th className="px-3 py-2 font-medium">What it means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {GRADE_ROWS.map(([grade, latency, meaning]) => (
                  <tr key={grade}>
                    <td className="px-3 py-2 font-mono font-medium">{grade}</td>
                    <td className="px-3 py-2 font-mono">{latency}</td>
                    <td className="px-3 py-2 text-muted-foreground">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            See the full{" "}
            <Link href="/about" className="text-primary underline underline-offset-4">
              measurement methodology
            </Link>{" "}
            for exactly how idle and loaded latency are sampled.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">How to fix it</h2>
          <ul className="list-disc pl-5">
            <li>
              Enable <strong>Smart Queue Management (SQM)</strong> — often labeled CAKE,
              fq_codel, or QoS — on your router. This is the single most effective fix: it
              actively manages queue length instead of letting buffers grow unbounded.
            </li>
            <li>
              If your router doesn&rsquo;t support SQM, consider one that does (many
              OpenWrt-, pfSense-, and EdgeOS-based routers ship CAKE built in).
            </li>
            <li>
              Some ISPs now ship bufferbloat-aware equipment by default — check whether your
              modem/router combo has a QoS or &ldquo;gaming mode&rdquo; setting before buying
              new hardware.
            </li>
            <li>
              A wired Ethernet connection removes Wi-Fi&rsquo;s own contention and retry
              delay from the picture, which can look like bufferbloat but has a different
              cause and fix.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Check your own connection</h2>
          <p>
            netgauge measures added latency automatically, alongside download, upload,
            jitter, and per-use-case verdicts for gaming, calls, and uploads.
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
