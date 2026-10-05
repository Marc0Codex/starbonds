import { ArrowLeft, ArrowRight, Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { Star } from "@/components/brand/star"
import { FilterBar } from "@/components/market/filter-bar"
import { ListingCard } from "@/components/market/listing-card"
import { buttonVariants } from "@/components/ui/button"
import { browseListings, type ListingKind, type ListingSort } from "@/lib/listings"
import { getAllTags } from "@/lib/profile"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav")
  return { title: t("marketplace") }
}

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
}

export default async function MarketplacePage({ searchParams }: PageProps<"/marketplace">) {
  const sp = await searchParams
  const kindParam = one(sp.kind)
  const kind: ListingKind | undefined = kindParam === "artwork" || kindParam === "service" ? kindParam : undefined
  const sortParam = one(sp.sort)
  const sort: ListingSort = sortParam === "price_asc" || sortParam === "price_desc" ? sortParam : "recent"
  const mediumTagId = Number(one(sp.medium)) || undefined
  const q = one(sp.q)?.trim().slice(0, 80) || undefined
  const page = Math.max(0, Number(one(sp.page)) || 0)
  const filtered = Boolean(kind || mediumTagId || q)

  const [{ listings, hasMore }, tags, t, tNav] = await Promise.all([
    browseListings({ kind, mediumTagId, q, sort, page }),
    getAllTags(),
    getTranslations("market"),
    getTranslations("nav"),
  ])
  const mediums = tags.filter((tag) => tag.kind === "medium")

  const pageHref = (p: number) => {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(sp)) if (typeof value === "string" && key !== "page") next.set(key, value)
    if (p > 0) next.set("page", String(p))
    return `/marketplace${next.size ? `?${next}` : ""}`
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="rise-in flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">{tNav("marketplace")}</h1>
          <p className="text-[17px] text-muted-foreground">
            {t("subtitle")} <span className="serif-accent text-lg text-primary">{t("subtitleAccent")}</span>
          </p>
        </div>
        <Link href="/marketplace/new" className={cn(buttonVariants(), "press")}>
          <Plus aria-hidden />
          {t("sell")}
        </Link>
      </header>

      <Suspense>
        <FilterBar mediums={mediums} />
      </Suspense>

      {listings.length === 0 ? (
        <div className="relative flex flex-col items-start gap-5 overflow-hidden rounded-[28px] border border-dashed p-8 sm:p-12">
          <Star spin className="absolute -right-12 -top-12 size-48 text-raise" />
          {filtered ? (
            <p className="relative text-lg text-muted-foreground">{t("emptyFiltered")}</p>
          ) : (
            <>
              <h2 className="relative text-[clamp(2rem,5vw,3rem)] font-extrabold leading-none">
                {t("emptyTitle")} <span className="serif-accent text-primary">{t("emptyAccent")}</span>
              </h2>
              <p className="relative max-w-md text-lg text-muted-foreground">{t("emptyBody")}</p>
              <Link href="/marketplace/new" className={cn(buttonVariants(), "press relative")}>
                <Plus aria-hidden />
                {t("sell")}
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {listings.map((listing, i) => (
            <li key={listing.id}>
              <ListingCard listing={listing} index={i} />
            </li>
          ))}
        </ul>
      )}

      {(page > 0 || hasMore) && (
        <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
          {page > 0 ? (
            <Link href={pageHref(page - 1)} className={buttonVariants({ variant: "outline" })}>
              <ArrowLeft aria-hidden />
              {t("prev")}
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link href={pageHref(page + 1)} className={buttonVariants({ variant: "outline" })}>
              {t("next")}
              <ArrowRight aria-hidden />
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
