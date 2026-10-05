import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"

import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" })
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" })

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta")
  return {
    title: { default: t("title"), template: "%s · STARBONDS" },
    description: t("description"),
    applicationName: "STARBONDS",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    appleWebApp: { capable: true, title: "STARBONDS", statusBarStyle: "default" },
    icons: { icon: "/icons/192", apple: "/icons/apple-180" },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8f9" },
    { media: "(prefers-color-scheme: dark)", color: "#120a0e" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
