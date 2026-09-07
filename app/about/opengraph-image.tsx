import { OG_SIZE, OG_CONTENT_TYPE, renderStaticOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "How netgauge measures your connection — methodology behind the speed test";

export default function Image() {
  return renderStaticOgImage("How netgauge measures your connection.", "Stream counts, warm-up discard, and why loaded latency matters.");
}
