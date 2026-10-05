import type { MetadataRoute } from "next"

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/u/", "/artworks/", "/posts/", "/listing/", "/privacy"],
      // Signed-in areas and private data are never indexed.
      disallow: ["/community", "/marketplace", "/match", "/messages", "/activity", "/settings", "/profile", "/onboarding", "/auth"],
    },
    host: SITE,
  }
}
