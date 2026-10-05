import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { ListingForm } from "@/components/market/listing-form"
import { getAllTags, getArtworksByOwner, getCurrentProfile } from "@/lib/profile"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("market")
  return { title: t("sell") }
}

export default async function NewListingPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  const [tags, artworks, t] = await Promise.all([
    getAllTags(),
    getArtworksByOwner(current.userId),
    getTranslations("market"),
  ])

  return (
    <div className="flex flex-col gap-10">
      <div className="rise-in flex flex-col gap-3">
        <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">
          {t("newTitle")} <span className="serif-accent text-primary">{t("newAccent")}</span>
        </h1>
        <p className="text-[17px] text-muted-foreground">{t("newSubtitle")}</p>
      </div>
      <ListingForm
        userId={current.userId}
        mediums={tags.filter((tag) => tag.kind === "medium")}
        artworks={artworks.map((a) => ({ id: a.id, title: a.title, images: a.images }))}
      />
    </div>
  )
}
