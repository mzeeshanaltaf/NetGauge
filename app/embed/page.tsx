import type { Metadata } from "next";
import { EmbedLoader } from "@/components/embed-loader";

// A thin duplicate of the homepage widget meant for <iframe> embedding on
// other sites — never worth indexing on its own.
export const metadata: Metadata = {
  title: "netgauge — Internet Speed Test",
  robots: { index: false, follow: true },
};

export default function EmbedPage() {
  return <EmbedLoader />;
}
