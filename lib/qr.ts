import "server-only"

import QRCode from "qrcode"

import { STAR_PATH } from "@/components/brand/star-path"
import { publicAppUrl } from "@/lib/site"

const INK = "#0d0a12"
const PAPER = "#f1ebf8"
const LAVENDER = "#bfa8ff"
const QUIET_ZONE = 3 // modules of margin around the code

/**
 * Static QR code (as SVG markup) pointing to the app. Error correction "H" (30%)
 * keeps it scannable with the STARBONDS star covering the center.
 */
export function qrSvg({ size = 1024, withLogo = true, url = publicAppUrl() } = {}) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" })
  const count = qr.modules.size
  const total = count + QUIET_ZONE * 2

  // Logo plate: ~20% of the code width, centered, snapped to whole modules.
  const plate = Math.max(5, Math.round(count * 0.2) | 1)
  const plateStart = Math.floor((count - plate) / 2)
  const insidePlate = (x: number, y: number) =>
    withLogo && x >= plateStart && x < plateStart + plate && y >= plateStart && y < plateStart + plate

  let d = ""
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (qr.modules.get(x, y) && !insidePlate(x, y)) d += `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z`
    }
  }

  const logo = withLogo
    ? (() => {
        const px = plateStart + QUIET_ZONE
        const star = plate * 0.78
        const offset = px + (plate - star) / 2
        return (
          `<rect x="${px}" y="${px}" width="${plate}" height="${plate}" rx="${plate * 0.24}" fill="${INK}"/>` +
          `<g transform="translate(${offset} ${offset}) scale(${star / 32})"><path d="${STAR_PATH}" fill="${LAVENDER}"/></g>`
        )
      })()
    : ""

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}" shape-rendering="crispEdges">` +
    `<title>STARBONDS — ${url}</title>` +
    `<rect width="${total}" height="${total}" fill="${PAPER}"/>` +
    `<path d="${d}" fill="${INK}"/>` +
    logo +
    `</svg>`
  )
}

export function qrSvgDataUri(options?: Parameters<typeof qrSvg>[0]) {
  return `data:image/svg+xml;base64,${Buffer.from(qrSvg(options)).toString("base64")}`
}
