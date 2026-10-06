import { ImageResponse } from "next/og"

import { STAR_PATH } from "@/components/brand/star-path"
import { qrSvgDataUri } from "@/lib/qr"
import { publicAppUrl } from "@/lib/site"

export const dynamic = "force-static"

// Shareable 1200×1200 card with the QR code (social posts, flyers, screens).
export function GET() {
  const url = publicAppUrl()
  const qr = qrSvgDataUri({ size: 720 })

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#0d0a12",
          color: "#f1ebf8",
          position: "relative",
        }}
      >
        <svg width="560" height="560" viewBox="0 0 32 32" style={{ position: "absolute", right: -140, top: -140 }}>
          <path d={STAR_PATH} fill="#3b1f6b" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d={STAR_PATH} fill="#bfa8ff" />
          </svg>
          <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>STARBONDS</span>
        </div>
        <div style={{ display: "flex", padding: 28, borderRadius: 48, background: "#f1ebf8" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={720} height={720} alt="" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 700 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: "#dfff4f" }} />
          Escanea y únete gratis
        </div>
        <span style={{ fontSize: 30, color: "#a99cbd" }}>{url.replace(/^https?:\/\//, "")}</span>
      </div>
    ),
    { width: 1200, height: 1200 }
  )

  image.headers.set("Content-Disposition", 'attachment; filename="starbonds-qr.png"')
  return image
}
