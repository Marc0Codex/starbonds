import { ImageResponse } from "next/og"

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
          background: "linear-gradient(135deg, #e11d48 0%, #fb7185 100%)",
          borderRadius: maskable || size.startsWith("apple") ? 0 : px * 0.22,
        }}
      >
        <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <path d="M20 3v4" />
          <path d="M22 5h-4" />
        </svg>
      </div>
    ),
    { width: px, height: px }
  )
}
