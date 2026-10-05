import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import { GenerativeArt } from "@/components/brand/generative-art"
import type { ListingCardData } from "@/lib/listings"
import { formatPrice } from "@/lib/format"
import { publicUrl } from "@/lib/storage"
import { cn } from "@/lib/utils"

export function ListingCard({ listing, index = 0 }: { listing: ListingCardData; index?: number }) {
  const t = useTranslations("market")
  const locale = useLocale()
  const unavailable = listing.status !== "active"

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="rise-in group flex flex-col gap-3"
      style={{ "--delay": `${Math.min(index, 8) * 50}ms` } as React.CSSProperties}
    >
      <div className="lift relative aspect-[4/5] overflow-hidden rounded-[22px] border bg-card">
        {!listing.cover && <GenerativeArt seed={listing.id} />}
        {listing.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={publicUrl("artworks", listing.cover) ?? ""}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn(
              "size-full object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]",
              unavailable && "opacity-50 grayscale"
            )}
          />
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold",
            listing.kind === "service" ? "bg-plum text-foreground" : "bg-background/85 text-foreground backdrop-blur-sm"
          )}
        >
          {listing.kind === "service" ? t("kindService") : t("kindArtwork")}
        </span>
        {unavailable && (
          <span className="absolute right-3 top-3 rounded-full bg-spark px-2.5 py-1 text-xs font-bold uppercase text-spark-foreground">
            {listing.status === "sold" ? t("sold") : t("hidden")}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-1">
        <span className="font-heading text-lg font-bold leading-tight tracking-tight">
          {formatPrice(listing.priceCents, listing.currency, locale)}
        </span>
        <span className="truncate text-[15px] group-hover:text-primary">{listing.title}</span>
        <span className="truncate text-sm text-muted-foreground">
          <span className="serif-accent">{t("by")}</span> {listing.seller.displayName}
        </span>
      </div>
    </Link>
  )
}
