"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { ThroughputPoint } from "@/hooks/use-speed-test";

interface LiveChartProps {
  downloadSeries: ThroughputPoint[];
  uploadSeries: ThroughputPoint[];
}

export function LiveChart({ downloadSeries, uploadSeries }: LiveChartProps) {
  const hasData = downloadSeries.length > 1 || uploadSeries.length > 1;

  return (
    <div className="h-36 w-full max-w-2xl">
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="download-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="upload-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="elapsedMs"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(ms: number) => `${Math.round(ms / 1000)}s`}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <Area
              data={downloadSeries}
              dataKey="mbps"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#download-fill)"
              isAnimationActive={false}
              connectNulls
            />
            <Area
              data={uploadSeries}
              dataKey="mbps"
              type="monotone"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#upload-fill)"
              isAnimationActive={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
          Throughput will plot here once the test starts.
        </div>
      )}
    </div>
  );
}
