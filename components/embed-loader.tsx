"use client";

import dynamic from "next/dynamic";
import { SpeedTestSkeleton } from "@/components/speed-test-skeleton";

// Same ssr:false boundary as the homepage widget (see speed-test-loader.tsx)
// and for the same reason: the engine reads browser-only APIs during init,
// and next/dynamic's ssr:false isn't allowed directly inside a Server
// Component page.
const EmbedWidget = dynamic(() => import("@/components/embed-widget"), {
  ssr: false,
  loading: () => <SpeedTestSkeleton />,
});

export function EmbedLoader() {
  return <EmbedWidget />;
}
