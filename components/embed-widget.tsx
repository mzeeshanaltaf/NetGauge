"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gauge } from "@/components/gauge";
import { ResultCard } from "@/components/result-card";
import { useSpeedTest, type ThroughputPoint } from "@/hooks/use-speed-test";
import type { SpeedTestProgress } from "@/lib/speedtest/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// See speed-test.tsx: recharts is left unmounted (not just code-split) until
// a test has actually produced data, so a fresh load never fetches it.
const LiveChart = dynamic(() => import("@/components/live-chart").then((m) => m.LiveChart), { ssr: false });

function ChartPlaceholder() {
  return (
    <div className="flex h-36 w-full max-w-2xl items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
      Throughput will plot here once the test starts.
    </div>
  );
}

interface GaugeState {
  value: number;
  max: number;
  displayValue: string;
  unit: string;
  label: string;
  color: string;
}

function niceMax(mbps: number): number {
  if (mbps <= 25) return 50;
  if (mbps <= 100) return 200;
  if (mbps <= 300) return 500;
  return 1000;
}

function throughputGauge(mbps: number, label: "Download" | "Upload"): GaugeState {
  return {
    value: mbps,
    max: niceMax(mbps),
    displayValue: mbps >= 100 ? mbps.toFixed(0) : mbps.toFixed(1),
    unit: "Mbps",
    label,
    color: label === "Download" ? "var(--chart-1)" : "var(--chart-2)",
  };
}

function lastReading(series: ThroughputPoint[]): number {
  return series.length > 0 ? series[series.length - 1].mbps : 0;
}

function statusText(phase: SpeedTestProgress["phase"] | undefined): string {
  switch (phase) {
    case "idle-latency":
      return "Pinging";
    case "download":
    case "loaded-latency-down":
      return "Testing download";
    case "upload":
    case "loaded-latency-up":
      return "Testing upload";
    default:
      return "Measuring";
  }
}

// Chrome-less version of the test for <iframe> embedding on other sites. No
// site nav/footer, no local history, no DB submission — just the engine and
// a result, plus a link back to netgauge for attribution.
export default function EmbedWidget() {
  const { status, progress, result, error, downloadSeries, uploadSeries, start } = useSpeedTest();

  const downloadGauge = useMemo<GaugeState>(() => {
    const mbps = status === "done" && result ? result.download.mbps : lastReading(downloadSeries);
    return throughputGauge(mbps, "Download");
  }, [status, result, downloadSeries]);

  const uploadGauge = useMemo<GaugeState>(() => {
    const mbps = status === "done" && result ? result.upload.mbps : lastReading(uploadSeries);
    return throughputGauge(mbps, "Upload");
  }, [status, result, uploadSeries]);

  return (
    <div className="flex w-full flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full items-start justify-center gap-6 sm:gap-10">
        <Gauge {...downloadGauge} />
        <Gauge {...uploadGauge} />
      </div>

      {status === "error" ? (
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <AlertTriangle className="size-5" style={{ color: "var(--grade-bad)" }} strokeWidth={1.75} />
          <p className="text-sm text-muted-foreground">{error ?? "The test could not complete."}</p>
          <Button onClick={start} className="h-10 px-6 text-sm">
            Try again
          </Button>
        </div>
      ) : status === "running" ? (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          {statusText(progress?.phase)}
        </span>
      ) : status === "done" ? (
        <Button onClick={start} variant="outline" className="h-10 px-6 text-sm">
          Test again
        </Button>
      ) : (
        <Button onClick={start} className="h-10 px-6 text-sm">
          Start test
        </Button>
      )}

      {status === "idle" ? (
        <ChartPlaceholder />
      ) : (
        <LiveChart downloadSeries={downloadSeries} uploadSeries={uploadSeries} />
      )}

      {result && <ResultCard result={result} />}

      <a
        href={SITE_URL || "/"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Powered by netgauge — test your own connection →
      </a>
    </div>
  );
}
