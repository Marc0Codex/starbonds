import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site"

const SITE = siteUrl()

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
