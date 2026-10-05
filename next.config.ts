import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage public buckets
      { protocol: "https", hostname: "deyyrcruqjipchofigzz.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Google OAuth avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
}

export default withNextIntl(nextConfig)
