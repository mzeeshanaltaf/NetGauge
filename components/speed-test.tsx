"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gauge } from "@/components/gauge";
import { ResultCard } from "@/components/result-card";
import { IspPanel } from "@/components/isp-panel";
import { useSpeedTest, type ThroughputPoint } from "@/hooks/use-speed-test";
import { useNetworkMeta } from "@/hooks/use-network-meta";
import { useResultSubmission } from "@/hooks/use-result-submission";
import { loadHistory, subscribeToHistory } from "@/lib/history";
import type { SpeedTestProgress } from "@/lib/speedtest/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// recharts is a large dependency; both charts render nothing meaningful until
// there's data (no series yet, or no saved history), so they're not just
// code-split but also left unmounted — and therefore unfetched — until that
// data actually exists. This is what a fresh, no-history Lighthouse run sees.
const LiveChart = dynamic(() => import("@/components/live-chart").then((m) => m.LiveChart), { ssr: false });
const History = dynamic(() => import("@/components/history").then((m) => m.History), { ssr: false });

function ChartPlaceholder() {
  return (
    <div className="flex h-36 w-full max-w-2xl items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
      Throughput will plot here once the test starts.
    </div>
  );
}

function ShareLink({ shareId, submitting }: { shareId: string | null; submitting: boolean }) {
  const [copied, setCopied] = useState(false);
  if (submitting) {
    return <p className="text-xs text-muted-foreground">Saving result…</p>;
  }
  if (!shareId) return null;

  const url = `${SITE_URL}/r/${shareId}`;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Link copied" : "Copy share link"}
    </Button>
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

// A gigabit line still needs to read as "mostly full" against a fixed cap,
// while a 20 Mbps DSL line shouldn't look empty against a 1000 Mbps scale.
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

export default function SpeedTest() {
  const { status, progress, result, error, downloadSeries, uploadSeries, start } = useSpeedTest();
  const { meta, metaFailed, geo } = useNetworkMeta();
  const { shareId, submitting } = useResultSubmission(result, meta, geo);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    const check = () => setHasHistory(loadHistory().length > 0);
    check();
    return subscribeToHistory(check);
  }, []);

  const downloadGauge = useMemo<GaugeState>(() => {
    const mbps = status === "done" && result ? result.download.mbps : lastReading(downloadSeries);
    return throughputGauge(mbps, "Download");
  }, [status, result, downloadSeries]);

  const uploadGauge = useMemo<GaugeState>(() => {
    const mbps = status === "done" && result ? result.upload.mbps : lastReading(uploadSeries);
    return throughputGauge(mbps, "Upload");
  }, [status, result, uploadSeries]);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex w-full items-start justify-center gap-6 sm:gap-10">
        <Gauge {...downloadGauge} />
        <Gauge {...uploadGauge} />
      </div>

      {status === "error" ? (
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <AlertTriangle className="size-5" style={{ color: "var(--grade-bad)" }} strokeWidth={1.75} />
          <p className="text-sm text-muted-foreground">{error ?? "The test could not complete."}</p>
          <Button onClick={start} className="h-11 px-8 text-base">
            Try again
          </Button>
        </div>
      ) : status === "running" ? (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          {statusText(progress?.phase)}
        </span>
      ) : status === "done" ? (
        <Button onClick={start} variant="outline" className="h-11 px-8 text-base">
          Test again
        </Button>
      ) : (
        <Button onClick={start} className="h-11 px-8 text-base">
          Start test
        </Button>
      )}

      {status === "idle" ? (
        <ChartPlaceholder />
      ) : (
        <LiveChart downloadSeries={downloadSeries} uploadSeries={uploadSeries} />
      )}

      {result && (
        <>
          <ResultCard result={result} />
          <ShareLink shareId={shareId} submitting={submitting} />
        </>
      )}

      <IspPanel meta={meta} metaFailed={metaFailed} geo={geo} />

      {hasHistory && <History />}
    </div>
  );
}
