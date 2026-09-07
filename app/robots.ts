import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://netgauge.zeeshanai.cloud";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/embed", "/r/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
