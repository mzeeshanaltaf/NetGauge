import { OG_SIZE, OG_CONTENT_TYPE, renderStaticOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Contact netgauge — feedback, bug reports, and data deletion requests";

export default function Image() {
  return renderStaticOgImage("Contact & feedback.", "Found a bug or have an idea? We read everything.");
}
