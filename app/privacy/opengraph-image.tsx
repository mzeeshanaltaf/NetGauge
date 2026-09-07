import { OG_SIZE, OG_CONTENT_TYPE, renderStaticOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "netgauge privacy policy — what we store, what we don't, and how to request deletion";

export default function Image() {
  return renderStaticOgImage("Privacy policy.", "No raw IPs stored. Ever.");
}
