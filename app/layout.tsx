import type { Metadata, Viewport } from "next"
import { Instrument_Sans, Instrument_Serif, Syne } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"

import { Providers } from "@/components/providers"
import "./globals.css"

const syne = Syne({ variable: "--font-syne", subsets: ["latin"], display: "swap" })
const instrumentSans = Instrument_Sans({ variable: "--font-instrument-sans", subsets: ["latin"], display: "swap" })
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta")
  return {
    title: { default: t("title"), template: "%s · STARBONDS" },
    description: t("description"),
    applicationName: "STARBONDS",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    appleWebApp: { capable: true, title: "STARBONDS", statusBarStyle: "black-translucent" },
    icons: { icon: "/icons/192", apple: "/icons/apple-180" },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: "#0d0a12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      className={`${syne.variable} ${instrumentSans.variable} ${instrumentSerif.variable} dark h-full antialiased`}
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
