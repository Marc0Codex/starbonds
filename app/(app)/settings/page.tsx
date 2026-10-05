import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Preferences } from "@/components/settings/preferences"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav")
  return { title: t("settings") }
}

export default async function SettingsPage() {
  const t = await getTranslations("nav")
  const ts = await getTranslations("sections")

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{t("settings")}</h1>
        <p className="text-muted-foreground">{ts("settingsDescription")}</p>
      </header>
      <section className="rounded-2xl border bg-card p-6">
        <Preferences />
      </section>
    </div>
  )
}
