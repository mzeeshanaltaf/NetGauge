import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BufferbloatGrade, SpeedTestResult } from "@/lib/speedtest/types";

interface ResultCardProps {
  result: SpeedTestResult;
}

const GRADE_COPY: Record<BufferbloatGrade, string> = {
  "A+": "Added latency is negligible. Calls and games stay smooth even while this line is saturated.",
  A: "Added latency is very low. Calls and games hold up well under load.",
  B: "Added latency is noticeable under load. Most calls and games are still fine.",
  C: "Added latency is significant. Expect lag in calls or games while something else is uploading or downloading.",
  D: "Added latency is severe under load. Calls and games will stutter when the line is busy.",
  F: "Added latency is extreme under load. A single large transfer can stall everything else on this connection.",
};

const GRADE_CLASS: Record<BufferbloatGrade, string> = {
  "A+": "bg-grade-good text-grade-foreground",
  A: "bg-grade-good text-grade-foreground",
  B: "bg-grade-mid text-grade-foreground",
  C: "bg-grade-mid text-grade-foreground",
  D: "bg-grade-bad text-grade-foreground",
  F: "bg-grade-bad text-grade-foreground",
};

function formatMbps(mbps: number): string {
  return mbps >= 100 ? mbps.toFixed(0) : mbps.toFixed(1);
}

function formatMs(ms: number): string {
  return Math.round(ms).toString();
}

export function ResultCard({ result }: ResultCardProps) {
  const { idleLatency, download, upload, loadedLatencyDown, loadedLatencyUp, bufferbloat, verdicts } = result;

  return (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
        <div className="flex flex-col gap-1 bg-card px-5 py-4">
          <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <ArrowDown className="size-3.5" strokeWidth={1.75} style={{ color: "var(--chart-1)" }} />
            Download
          </span>
          <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
            {formatMbps(download.mbps)}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">Mbps</span>
          </span>
        </div>
        <div className="flex flex-col gap-1 bg-card px-5 py-4">
          <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <ArrowUp className="size-3.5" strokeWidth={1.75} style={{ color: "var(--chart-2)" }} />
            Upload
          </span>
          <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
            {formatMbps(upload.mbps)}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">Mbps</span>
          </span>
        </div>
      </div>

      <div className="mt-6 divide-y divide-border rounded-lg border border-border">
        <div className="grid grid-cols-2 gap-x-4 px-5 py-3 sm:grid-cols-4">
          <Metric label="Idle ping" value={`${formatMs(idleLatency.latencyMs)} ms`} />
          <Metric label="Jitter" value={`${formatMs(idleLatency.jitterMs)} ms`} />
          <Metric label="Loaded ping (down)" value={`${formatMs(loadedLatencyDown.latencyMs)} ms`} />
          <Metric label="Loaded ping (up)" value={`${formatMs(loadedLatencyUp.latencyMs)} ms`} />
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full font-mono text-base font-semibold",
              GRADE_CLASS[bufferbloat.grade]
            )}
          >
            {bufferbloat.grade}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              Bufferbloat: +{formatMs(bufferbloat.addedLatencyMs)} ms under load
            </span>
            <span className="text-sm text-muted-foreground">{GRADE_COPY[bufferbloat.grade]}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-foreground">Good for</h2>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {verdicts.map((verdict) => (
            <li key={verdict.id} className="flex items-center gap-3 px-4 py-2.5">
              {verdict.pass ? (
                <Check className="size-4 shrink-0" strokeWidth={2} style={{ color: "var(--grade-good)" }} />
              ) : (
                <X className="size-4 shrink-0" strokeWidth={2} style={{ color: "var(--grade-bad)" }} />
              )}
              <span className="text-sm text-foreground">{verdict.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}
