import { ImageResponse } from "next/og"

import { STAR_PATH } from "@/components/brand/star"

export const alt = "STARBONDS — La red social para artistas"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Default share image (pages with artwork override it with their own images).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0d0a12",
          color: "#f1ebf8",
          position: "relative",
        }}
      >
        <svg width="520" height="520" viewBox="0 0 32 32" style={{ position: "absolute", right: -90, top: -90 }}>
          <path d={STAR_PATH} fill="#3b1f6b" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <path d={STAR_PATH} fill="#bfa8ff" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>STARBONDS</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 92, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>Tu arte, visto.</span>
          <span style={{ fontSize: 92, fontWeight: 800, lineHeight: 1, letterSpacing: -3, color: "#bfa8ff" }}>
            Tu talento, conectado.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: "#a99cbd" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#dfff4f" }} />
          La red social para artistas emergentes
        </div>
      </div>
    ),
    size
  )
}
