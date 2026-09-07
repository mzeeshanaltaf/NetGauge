import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://netgauge.zeeshanai.cloud";
const TITLE = "Why Is My Internet Slower Than Advertised?";
const DESCRIPTION =
  "Paying for 500 Mbps but seeing far less? Here are the real reasons your speed test results fall short of your plan, and how to tell which one applies to you.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/guides/speed-slower-than-advertised` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides/speed-slower-than-advertised`,
    type: "article",
  },
};

export default function SlowerThanAdvertisedGuide() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-16 pb-24">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Why Is My Internet Slower Than Advertised?", path: "/guides/speed-slower-than-advertised" },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        / <span className="text-foreground">Why Is My Internet Slower Than Advertised?</span>
      </nav>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Why Is My Internet Slower Than Advertised?
        </h1>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">
          &ldquo;Up to&rdquo; on a plan and the number a test shows you are rarely the same thing, for
          reasons that are usually fixable.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">&ldquo;Up to&rdquo; is a ceiling, not a promise</h2>
          <p>
            ISP plans are marketed as &ldquo;up to&rdquo; a number for a reason: that figure is
            the best case, measured under ideal conditions the plan rarely delivers in
            practice — a wired connection, no other traffic on the line, and a test server
            close to the ISP&rsquo;s own network. Every layer between that ideal case and your
            actual device — Wi-Fi, your router, shared neighborhood infrastructure, the test
            server itself — can take a bite out of the number before it reaches you.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">The most common causes</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>Wi-Fi, not your line.</strong> Wi-Fi shares airtime with every other
              device on the same channel — neighbors&rsquo; networks included — and older
              802.11n/ac hardware or a 2.4 GHz connection caps out well below gigabit
              regardless of your plan. Test over Ethernet to isolate whether the bottleneck
              is your line or your Wi-Fi.
            </li>
            <li>
              <strong>Network congestion at peak hours.</strong> Cable and some fiber
              networks share bandwidth across a neighborhood segment; results commonly drop
              in the evening when everyone nearby is streaming at once, and recover overnight.
            </li>
            <li>
              <strong>Router or modem hardware limits.</strong> Older routers have wired and
              wireless throughput ceilings well below what modern fiber and cable plans
              deliver — a five-year-old router is a common, invisible bottleneck on a
              recently upgraded plan.
            </li>
            <li>
              <strong>Distance to the test server.</strong> A test that routes your traffic
              across the country will always measure lower than your real line speed. This
              is exactly why netgauge runs on Cloudflare&rsquo;s 300+ edge locations instead
              of a single origin server — see the{" "}
              <Link href="/about" className="text-primary underline underline-offset-4">
                methodology
              </Link>{" "}
              for how that works.
            </li>
            <li>
              <strong>A VPN or active download elsewhere on the network.</strong> A VPN adds
              a hop and encryption overhead that directly caps throughput; a device
              mid-download or mid-backup on the same network eats into whatever bandwidth
              your test can measure.
            </li>
            <li>
              <strong>Server-side throttling on the test itself.</strong> Some free speed
              tests cap concurrent connections or bytes served, understating a genuinely fast
              line. netgauge runs 6 parallel streams and scales request size up adaptively
              specifically to avoid this failure mode — see the full{" "}
              <Link href="/about" className="text-primary underline underline-offset-4">
                methodology
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">A fast number that still feels slow</h2>
          <p>
            If your download number looks fine but calls stutter or games lag, the number
            itself isn&rsquo;t the problem —{" "}
            <Link href="/guides/what-is-bufferbloat" className="text-primary underline underline-offset-4">
              bufferbloat
            </Link>{" "}
            usually is. A high Mbps figure and a bad bufferbloat grade can coexist on the
            exact same connection.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Narrow it down</h2>
          <p>
            Run a test wired and over Wi-Fi, at a quiet hour and a busy one, and compare
            against the{" "}
            <Link href="/guides/good-internet-speed" className="text-primary underline underline-offset-4">
              thresholds your actual use case needs
            </Link>{" "}
            rather than your plan&rsquo;s advertised ceiling.
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
