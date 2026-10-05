import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BlockedList } from "@/components/settings/blocked-list"
import { DeleteAccount } from "@/components/settings/delete-account"
import { Preferences } from "@/components/settings/preferences"
import { getBlockedUsers } from "@/lib/activity"
import { getCurrentProfile } from "@/lib/profile"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav")
  return { title: t("settings") }
}

export default async function SettingsPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  const [t, ts, tset, tLegal, blocked] = await Promise.all([
    getTranslations("nav"),
    getTranslations("sections"),
    getTranslations("settings"),
    getTranslations("legal"),
    getBlockedUsers(),
  ])

  return (
    <div className="flex flex-col gap-10">
      <header className="rise-in flex flex-col gap-3">
        <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">{t("settings")}</h1>
        <p className="text-[17px] text-muted-foreground">{ts("settingsDescription")}</p>
      </header>

      <Link
        href="/profile/edit"
        className="rise-in group flex items-center justify-between gap-6 rounded-[24px] border bg-card p-6 transition-[background-color,padding] duration-300 hover:bg-raise hover:pl-8"
        style={{ "--delay": "0.05s" } as React.CSSProperties}
      >
        <span className="flex flex-col gap-1">
          <span className="font-heading text-lg font-bold">{tset("profile")}</span>
          <span className="text-muted-foreground">{tset("profileDescription")}</span>
        </span>
        <ArrowRight className="size-6 transition-transform duration-300 group-hover:-rotate-45 group-hover:text-spark" aria-hidden />
      </Link>

      <section className="rise-in rounded-[24px] border bg-card p-6" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        <Preferences />
      </section>

      <div className="rise-in rounded-[24px] border bg-card p-6" style={{ "--delay": "0.15s" } as React.CSSProperties}>
        <BlockedList users={blocked} />
      </div>

      <Link
        href="/privacy"
        className="rise-in group flex items-center justify-between gap-6 rounded-[24px] border bg-card p-6 transition-[background-color,padding] duration-300 hover:bg-raise hover:pl-8"
        style={{ "--delay": "0.18s" } as React.CSSProperties}
      >
        <span className="flex flex-col gap-1">
          <span className="font-heading text-lg font-bold">{tLegal("privacyTitle")}</span>
          <span className="text-muted-foreground">{tLegal("privacyDescription")}</span>
        </span>
        <ArrowRight className="size-6 transition-transform duration-300 group-hover:-rotate-45 group-hover:text-spark" aria-hidden />
      </Link>

      <div className="rise-in" style={{ "--delay": "0.2s" } as React.CSSProperties}>
        <DeleteAccount username={current.profile.username} />
      </div>
    </div>
  )
}
