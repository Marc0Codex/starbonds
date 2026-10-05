import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { ArtworkForm } from "@/components/artworks/artwork-form"
import { getCurrentProfile } from "@/lib/profile"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile")
  return { title: t("addArtwork") }
}

export default async function NewArtworkPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  const t = await getTranslations("artworks")

  return (
    <div className="flex flex-col gap-10">
      <div className="rise-in flex flex-col gap-3">
        <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">
          {t("newTitle")} <span className="serif-accent text-primary">{t("newAccent")}</span>
        </h1>
        <p className="text-[17px] text-muted-foreground">{t("newSubtitle")}</p>
      </div>
      <ArtworkForm userId={current.userId} />
    </div>
  )
}
