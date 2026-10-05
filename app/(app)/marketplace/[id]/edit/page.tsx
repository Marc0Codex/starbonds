import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { ListingForm } from "@/components/market/listing-form"
import { getListing } from "@/lib/listings"
import { getAllTags, getArtworksByOwner, getCurrentProfile } from "@/lib/profile"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("market")
  return { title: t("edit") }
}

export default async function EditListingPage({ params }: PageProps<"/marketplace/[id]/edit">) {
  const { id } = await params
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  if (!UUID_RE.test(id)) notFound()

  const listing = await getListing(id)
  if (!listing || listing.seller_id !== current.userId) notFound()

  const [tags, artworks, t] = await Promise.all([
    getAllTags(),
    getArtworksByOwner(current.userId),
    getTranslations("market"),
  ])

  return (
    <div className="flex flex-col gap-10">
      <h1 className="rise-in text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">
        {t("editTitle")} <span className="serif-accent text-primary">{t("editAccent")}</span>
      </h1>
      <ListingForm
        userId={current.userId}
        mediums={tags.filter((tag) => tag.kind === "medium")}
        artworks={artworks.map((a) => ({ id: a.id, title: a.title, images: a.images }))}
        initial={{
          id: listing.id,
          kind: listing.kind,
          title: listing.title,
          description: listing.description,
          price: String(listing.price_cents / 100),
          currency: listing.currency,
          mediumTagId: listing.medium_tag_id,
          artworkId: listing.artwork_id,
          images: listing.images,
        }}
      />
    </div>
  )
}
