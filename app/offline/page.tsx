import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Logo } from "@/components/logo"
import { Plei } from "@/components/plei/plei"
import { RetryButton } from "@/components/pwa/retry-button"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("offline")
  return { title: `${t("title")} ${t("accent")}`, robots: { index: false } }
}

// Served by the service worker when a page can't load without a connection.
export default async function OfflinePage() {
  const t = await getTranslations("offline")
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 py-6 sm:px-10">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="flex max-w-md flex-col items-start gap-6">
          <Plei mood="sleepy" size={120} />
          <h1 className="text-[clamp(2.75rem,8vw,4rem)] font-extrabold leading-none">
            {t("title")} <span className="serif-accent text-primary">{t("accent")}</span>
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{t("body")}</p>
          <RetryButton label={t("retry")} />
        </div>
      </main>
    </div>
  )
}
