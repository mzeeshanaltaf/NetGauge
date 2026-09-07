import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — netgauge",
  description: "What netgauge stores, what it doesn't, and how to request deletion.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-16 pb-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Privacy Policy
        </h1>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">
          What we store when you run a test, what stays only in your browser, and how to
          have your data removed.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">What we store</h2>
          <p>
            When you run a test, we save the result — download, upload, latency, jitter,
            and bufferbloat grade — to our database. Alongside it we store your{" "}
            <strong>ISP, ASN, city, and country</strong>, so results can be aggregated and
            compared by location and network. We do <strong>not</strong> store your raw IP
            address: it&rsquo;s salted and passed through a one-way hash (SHA-256) before
            being written, so the stored value can never be reversed back into your
            address. Your IP may be shown to you client-side, in the connection panel of
            your own browser, but it never reaches our database in that form.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">What stays on your device</h2>
          <p>
            Your test history is kept entirely in your browser&rsquo;s{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">localStorage</code> and
            is never uploaded to our servers. Clearing your browser data or using a
            different browser or device will not show past results, because we never had
            them.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Share links are public</h2>
          <p>
            If you share a result, anyone with that link can view it — treat sharing a
            result link the same as publishing it. We don&rsquo;t index share pages in
            search engines, but the page itself is not access-controlled: possession of the
            URL is sufficient to view it.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Who processes your data</h2>
          <p>The following third parties handle data as part of running this service:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Vercel</strong> — hosts the site and application, and supplies the
              coarse geo headers (city/country) used to enrich results.
            </li>
            <li>
              <strong>Cloudflare</strong> — carries the actual test traffic (download/upload
              bytes) from its edge network, and supplies ASN/ISP information.
            </li>
            <li>
              <strong>Upstash</strong> — provides the Redis store used to rate-limit
              submissions and abusive requests.
            </li>
            <li>
              <strong>Self-hosted n8n</strong> — receives contact form submissions and
              routes them to us; it runs on infrastructure we control, not a third-party
              SaaS inbox.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Retention and deletion</h2>
          <p>
            Every completed test is saved to our database — whether or not you share it —
            and is retained indefinitely for network statistics. Because no raw IP or other
            direct identifier is stored alongside it, we cannot look results up by who ran
            them; only by the ID in a result&rsquo;s share link. If you want a specific
            result deleted, contact us at{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              /contact
            </Link>{" "}
            with its share link and we will remove it.
          </p>
        </section>
      </div>
    </div>
  );
}
