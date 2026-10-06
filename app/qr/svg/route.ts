import { qrSvg } from "@/lib/qr"

export const dynamic = "force-static"

// Vector QR code for print (any size).
export function GET() {
  return new Response(qrSvg({ size: 1024 }), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": 'attachment; filename="starbonds-qr.svg"',
      "Cache-Control": "public, max-age=86400",
    },
  })
}
