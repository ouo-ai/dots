import { ImageResponse } from "next/og"

export const alt = "Dots — your 24/7 on-demand AI personal assistant"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "74px 82px",
          color: "#f8fafc",
          background:
            "radial-gradient(circle at 83% 14%, #3b37a2 0%, transparent 33%), radial-gradient(circle at 22% 82%, #174ea6 0%, transparent 38%), #070914",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
          Dots<span style={{ color: "#79a6ff" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 91, fontWeight: 750, letterSpacing: -5, lineHeight: 1 }}>Your day, in Dots.</div>
          <div style={{ fontSize: 34, color: "#cbd5e1", lineHeight: 1.25 }}>
            Your 24/7 on-demand AI personal assistant
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 23, color: "#a8b8d7" }}>dotsai.bot</div>
      </div>
    ),
    size,
  )
}
