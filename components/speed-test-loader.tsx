"use client";

import dynamic from "next/dynamic";
import { SpeedTestSkeleton } from "@/components/speed-test-skeleton";

// The widget initialises state from crypto.randomUUID(), performance.now(),
// and navigator.connection — all browser-only. `ssr: false` isn't allowed
// on next/dynamic inside a Server Component, so this thin client wrapper is
// what app/page.tsx imports; see docs/phase-4-ui.md's "structural decision".
const SpeedTest = dynamic(() => import("@/components/speed-test"), {
  ssr: false,
  loading: () => <SpeedTestSkeleton />,
});

export function SpeedTestLoader() {
  return <SpeedTest />;
}
