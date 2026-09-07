import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Shared visual for every static (non-result) page's opengraph-image.tsx —
// keeps branding consistent with app/r/[id]/opengraph-image.tsx without
// duplicating the ImageResponse markup across five route files.
export function renderStaticOgImage(title: string, subtitle: string, cta = "Test your connection →") {
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

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 980 }}>
          <span style={{ fontSize: 64, fontWeight: 700, color: "#fafafa", lineHeight: 1.15 }}>{title}</span>
          <span style={{ fontSize: 28, color: "#a3a3a3" }}>{subtitle}</span>
        </div>

        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#60a5fa" }}>{cta}</div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
