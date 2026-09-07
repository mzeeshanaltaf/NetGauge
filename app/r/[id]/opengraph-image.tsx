import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "netgauge internet speed test result";

const GRADE_COLOR: Record<string, string> = {
  "A+": "#22c55e",
  A: "#22c55e",
  B: "#eab308",
  C: "#eab308",
  D: "#ef4444",
  F: "#ef4444",
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.result.findUnique({ where: { id } });

  const downloadMbps = row ? row.downloadMbps.toNumber() : 0;
  const uploadMbps = row ? row.uploadMbps.toNumber() : 0;
  const grade = row?.bufferbloat ?? "—";
  const gradeColor = GRADE_COLOR[grade] ?? "#94a3b8";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          backgroundColor: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#fafafa" }}>netgauge</div>

        <div style={{ display: "flex", alignItems: "center", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 26, color: "#a3a3a3" }}>Download</span>
            <span style={{ fontSize: 108, fontWeight: 700, color: "#fafafa" }}>
              {downloadMbps.toFixed(0)}
              <span style={{ fontSize: 40, fontWeight: 400, color: "#a3a3a3" }}> Mbps</span>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 26, color: "#a3a3a3" }}>Upload</span>
            <span style={{ fontSize: 108, fontWeight: 700, color: "#fafafa" }}>
              {uploadMbps.toFixed(0)}
              <span style={{ fontSize: 40, fontWeight: 400, color: "#a3a3a3" }}> Mbps</span>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: gradeColor,
                fontSize: 40,
                fontWeight: 700,
                color: "#0a0a0a",
              }}
            >
              {grade}
            </div>
            <span style={{ fontSize: 20, color: "#a3a3a3" }}>Bufferbloat</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#60a5fa" }}>Test your connection →</div>
      </div>
    ),
    { ...size }
  );
}
