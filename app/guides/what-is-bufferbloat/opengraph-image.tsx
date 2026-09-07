import { OG_SIZE, OG_CONTENT_TYPE, renderStaticOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "What is bufferbloat? Causes, symptoms, and how to fix it";

export default function Image() {
  return renderStaticOgImage("What is bufferbloat?", "The hidden delay a plain speed test never shows you.");
}
