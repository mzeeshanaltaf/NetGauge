import { OG_SIZE, OG_CONTENT_TYPE, renderStaticOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "netgauge — internet speed test measuring download, upload, latency, and bufferbloat";

export default function Image() {
  return renderStaticOgImage("Speed, latency & bufferbloat in one test.", "Free internet speed test with per-use-case verdicts.");
}
