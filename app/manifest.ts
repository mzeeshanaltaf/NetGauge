import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "netgauge — Internet Speed Test",
    short_name: "netgauge",
    description:
      "Measure download, upload, latency, jitter, and bufferbloat with per-use-case verdicts.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0060ac",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
