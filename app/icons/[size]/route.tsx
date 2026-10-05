import { ImageResponse } from "next/og"

import { STAR_PATH } from "@/components/brand/star"

const SIZES = ["192", "512", "maskable-512", "apple-180"] as const

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }))
}

export const dynamicParams = false

// PWA / home-screen icons rendered from code (no binary assets to maintain).
export async function GET(_request: Request, { params }: RouteContext<"/icons/[size]">) {
  const { size } = await params
  const px = Number(size.replace(/\D/g, ""))
  const maskable = size.startsWith("maskable")
  const glyph = Math.round(px * (maskable ? 0.42 : 0.56))

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0a12",
          borderRadius: maskable || size.startsWith("apple") ? 0 : px * 0.22,
        }}
      >
        <svg width={glyph} height={glyph} viewBox="0 0 32 32">
          <path d={STAR_PATH} fill="#bfa8ff" />
        </svg>
      </div>
    ),
    { width: px, height: px }
  )
}
