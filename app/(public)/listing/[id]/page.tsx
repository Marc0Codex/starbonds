import { Info } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { cache } from "react"

import { ContactSellerButton, OwnerListingActions } from "@/components/market/listing-actions"
import { ListingGallery } from "@/components/market/listing-gallery"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { buttonVariants } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { getListing } from "@/lib/listings"
import { getCurrentProfile } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"
import { tagLabel } from "@/lib/tags"
import { cn } from "@/lib/utils"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const load = cache(async (id: string) => (UUID_RE.test(id) ? getListing(id) : null))

export async function generateMetadata({ params }: PageProps<"/listing/[id]">): Promise<Metadata> {
  const { id } = await params
  const listing = await load(id)
  if (!listing) return {}
  const locale = await getLocale()
  return {
    title: `${listing.title} · ${formatPrice(listing.price_cents, listing.currency, locale)}`,
    description: listing.description.slice(0, 160) || undefined,
    openGraph: listing.images[0] ? { images: [publicUrl("artworks", listing.images[0]) ?? ""] } : undefined,
  }
}

export default async function ListingPage({ params }: PageProps<"/listing/[id]">) {
  const { id } = await params
  const [listing, current, locale, t] = await Promise.all([
    load(id),
    getCurrentProfile(),
    getLocale(),
    getTranslations("market"),
  ])
  // RLS hides "hidden" listings from everyone but the seller.
  if (!listing || !listing.seller) notFound()

  const seller = listing.seller
  const isOwn = current?.userId === listing.seller_id
  const unavailable = listing.status !== "active"

  return (
    <article className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="rise-in">
        <ListingGallery images={listing.images} title={listing.title} />
      </div>

      <aside className="flex flex-col gap-7 lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              listing.kind === "service" ? "border border-grape bg-plum" : "border"
            )}
          >
            {listing.kind === "service" ? t("kindService") : t("kindArtwork")}
          </span>
          {listing.medium && (
            <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
              {tagLabel(listing.medium, locale)}
            </span>
          )}
          {unavailable && (
            <span className="rounded-full bg-spark px-3 py-1 text-sm font-bold uppercase text-spark-foreground">
              {listing.status === "sold" ? t("sold") : t("hidden")}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[0.95]">
            <span className="reveal">
              <span className="break-words">{listing.title}</span>
            </span>
          </h1>
          <p className="fade-in font-heading text-3xl font-bold text-primary" style={{ "--delay": "0.3s" } as React.CSSProperties}>
            {formatPrice(listing.price_cents, listing.currency, locale)}
          </p>
        </div>

        <Link
          href={`/u/${seller.username}`}
          className="flex items-center gap-3 self-start rounded-full border bg-card py-1.5 pl-1.5 pr-5 transition-colors hover:border-primary"
        >
          <ProfileAvatar name={seller.display_name} src={publicUrl("avatars", seller.avatar_path)} />
          <span className="flex flex-col leading-tight">
            <span className="serif-accent text-sm text-muted-foreground">{t("by")}</span>
            <span className="font-semibold">{seller.display_name}</span>
          </span>
        </Link>

        {listing.description && (
          <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{listing.description}</p>
        )}

        {isOwn ? (
          <OwnerListingActions listingId={listing.id} status={listing.status} />
        ) : current ? (
          !unavailable && <ContactSellerButton listingId={listing.id} sellerName={seller.display_name} />
        ) : (
          <Link href={`/login?next=/listing/${listing.id}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            {t("signInToContact")}
          </Link>
        )}

        <p className="flex gap-3 rounded-[20px] border border-dashed p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          {t("paymentsSoon")}
        </p>
      </aside>
    </article>
  )
}
