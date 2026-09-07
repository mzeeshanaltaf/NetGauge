import { SpeedTestLoader } from "@/components/speed-test-loader";

const FAQ = [
  {
    question: "What is bufferbloat?",
    answer:
      "Bufferbloat is delay caused by oversized buffers in your router or modem queuing data instead of dropping it, so a ping that's normally 20 ms can jump into the hundreds while a large download or upload is running. We measure it by pinging your connection while it's fully loaded and comparing that to its idle latency.",
  },
  {
    question: "Why might my results differ from fast.com or speedtest.net?",
    answer:
      "Every test measures a different path at a different moment against different servers. netgauge runs from Cloudflare's 300+ edge locations and should land within about 10% of fast.com or speedtest.net on the same connection; a bigger gap usually means a busy network at the moment of testing.",
  },
  {
    question: "Do you store my IP address?",
    answer:
      "No. Your IP is shown to you in the connection panel but never written to our database. We store a one-way hash of it, which can't be reversed back into the original address.",
  },
  {
    question: "Why does this run on a Cloudflare Worker instead of your own server?",
    answer:
      "A speed test has to run close to you, not close to us. Cloudflare's network puts a server within a short hop of almost anywhere, so the bottleneck you see is your own line, not the distance to a single data center.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-16 pb-24">
      <div className="flex max-w-xl flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Speed, latency, and bufferbloat in one test.
        </h1>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">
          Download, upload, jitter, and loaded latency from Cloudflare&rsquo;s edge network, graded for bufferbloat and
          rated for gaming, calls, and uploads.
        </p>
      </div>

      <div className="mt-12 flex w-full justify-center">
        <SpeedTestLoader />
      </div>

      <section className="mt-24 w-full max-w-xl">
        <h2 className="text-lg font-semibold text-foreground">Frequently asked</h2>
        <div className="mt-4 divide-y divide-border border-t border-border">
          {FAQ.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:content-none">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
