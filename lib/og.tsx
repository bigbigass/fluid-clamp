import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "FluidClamp – CSS clamp() calculator for fluid typography";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.85 }}>FluidClamp</div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 16, lineHeight: 1.1 }}>CSS clamp() Calculator</div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.9 }}>Fluid typography · type scale · spacing · Tailwind</div>
        <div
          style={{
            marginTop: 48,
            fontSize: 34,
            fontFamily: "monospace",
            background: "rgba(0,0,0,0.35)",
            borderRadius: 16,
            padding: "20px 28px",
            display: "flex",
          }}
        >
          font-size: clamp(1rem, 0.8333rem + 0.8333vw, 1.5rem);
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
