"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { historyToCsv, historyToJson, loadHistory, subscribeToHistory, type HistoryEntry } from "@/lib/history";
import type { BufferbloatGrade } from "@/lib/speedtest/types";

const GRADE_COLOR: Record<BufferbloatGrade, string> = {
  "A+": "var(--grade-good)",
  A: "var(--grade-good)",
  B: "var(--grade-mid)",
  C: "var(--grade-mid)",
  D: "var(--grade-bad)",
  F: "var(--grade-bad)",
};

function formatMbps(mbps: number): string {
  return mbps >= 100 ? mbps.toFixed(0) : mbps.toFixed(1);
}

function download(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(loadHistory());
    return subscribeToHistory(() => setEntries(loadHistory()));
  }, []);

  if (entries.length === 0) return null;

  // Oldest first, so the trend chart reads left-to-right chronologically.
  const chronological = [...entries].reverse();

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Your history</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => download("netgauge-history.csv", historyToCsv(entries), "text/csv")}
          >
            <Download />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => download("netgauge-history.json", historyToJson(entries), "application/json")}
          >
            <Download />
            JSON
          </Button>
        </div>
      </div>

      {chronological.length > 1 && (
        <div className="mt-3 h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chronological} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="createdAt" hide />
              <YAxis hide domain={[0, "auto"]} />
              <Line
                dataKey="downloadMbps"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="uploadMbps"
                type="monotone"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-4 px-4 py-2.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: GRADE_COLOR[entry.bufferbloatGrade] }}
              aria-hidden="true"
            />
            <span className="w-32 shrink-0 text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span className="flex-1 font-mono text-sm text-foreground">
              {formatMbps(entry.downloadMbps)} / {formatMbps(entry.uploadMbps)}
              <span className="ml-1 text-xs text-muted-foreground">Mbps</span>
            </span>
            {entry.shareId ? (
              <a href={`/r/${entry.shareId}`} className="text-xs text-primary hover:underline">
                View
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
