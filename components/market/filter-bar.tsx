"use client"

import { Search, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useState, useTransition } from "react"

import { tagLabel } from "@/lib/tags"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

const selectClass =
  "h-11 rounded-full border bg-card px-4 text-[15px] outline-none transition-colors hover:border-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

export function FilterBar({ mediums }: { mediums: Tables<"tags">[] }) {
  const t = useTranslations("market")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get("q") ?? "")
  const [pending, startTransition] = useTransition()

  const kind = params.get("kind") ?? ""
  const medium = params.get("medium") ?? ""
  const sort = params.get("sort") ?? "recent"
  const hasFilters = Boolean(kind || medium || params.get("q") || (sort && sort !== "recent"))

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.delete("page")
    startTransition(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }))
  }

  const kinds = [
    { value: "", label: t("filterAll") },
    { value: "artwork", label: t("filterArtwork") },
    { value: "service", label: t("filterService") },
  ]

  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", pending && "opacity-60")} aria-label={t("filters")} role="search">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          update({ q: q.trim() || null })
        }}
        className="flex items-center gap-2 rounded-full border bg-card py-1 pl-5 pr-1 focus-within:border-ring"
      >
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor="market-q" className="sr-only">
          {t("search")}
        </label>
        <input
          id="market-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="press h-11 rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground hover:bg-spark hover:text-spark-foreground"
        >
          {t("search")}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {kinds.map((k) => (
          <button
            key={k.value || "all"}
            type="button"
            aria-pressed={kind === k.value}
            onClick={() => update({ kind: k.value || null })}
            className={cn(
              "min-h-11 rounded-full border px-4 text-[15px] transition-colors duration-200",
              kind === k.value ? "border-grape bg-plum font-medium" : "text-muted-foreground hover:bg-raise hover:text-foreground"
            )}
          >
            {k.label}
          </button>
        ))}

        <label htmlFor="market-medium" className="sr-only">
          {t("medium")}
        </label>
        <select
          id="market-medium"
          value={medium}
          onChange={(e) => update({ medium: e.target.value || null })}
          className={selectClass}
        >
          <option value="">{t("allMediums")}</option>
          {mediums.map((m) => (
            <option key={m.id} value={m.id}>
              {tagLabel(m, locale)}
            </option>
          ))}
        </select>

        <label htmlFor="market-sort" className="sr-only">
          {t("sort")}
        </label>
        <select
          id="market-sort"
          value={sort}
          onChange={(e) => update({ sort: e.target.value === "recent" ? null : e.target.value })}
          className={selectClass}
        >
          <option value="recent">{t("sortRecent")}</option>
          <option value="price_asc">{t("sortPriceAsc")}</option>
          <option value="price_desc">{t("sortPriceDesc")}</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ("")
              startTransition(() => router.push(pathname, { scroll: false }))
            }}
            className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
            {t("clear")}
          </button>
        )}
      </div>
    </div>
  )
}
