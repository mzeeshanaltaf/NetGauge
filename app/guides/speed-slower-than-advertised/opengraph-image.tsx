import { OG_SIZE, OG_CONTENT_TYPE, renderStaticOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Why is my internet slower than advertised? Common causes explained";

export default function Image() {
  return renderStaticOgImage("Slower than advertised?", "The real reasons your speed test falls short of your plan.");
}
