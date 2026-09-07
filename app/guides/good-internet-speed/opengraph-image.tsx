import { OG_SIZE, OG_CONTENT_TYPE, renderStaticOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "What is a good internet speed? Mbps thresholds by use case";

export default function Image() {
  return renderStaticOgImage("What's a good internet speed?", "Real Mbps thresholds for streaming, calls, gaming & uploads.");
}
