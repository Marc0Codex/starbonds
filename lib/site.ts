// Public base URL: explicit NEXT_PUBLIC_SITE_URL, else Vercel's production domain, else local dev.
export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return "http://localhost:3000"
}

const PRODUCTION_URL = "https://starbonds.vercel.app"

// Canonical public URL for things people print or share (QR codes): never localhost.
export function publicAppUrl() {
  const url = siteUrl().replace(/\/$/, "")
  return /localhost|127\.0\.0\.1/.test(url) ? PRODUCTION_URL : url
}
