"use client"

import { Check } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { tagLabel } from "@/lib/tags"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

type Tag = Tables<"tags">

// Toggle chips for one tag kind. Selection lives in the parent (shared across kinds).
export function TagPicker({
  tags,
  selected,
  onToggle,
  legend,
  hideLegend = false,
}: {
  tags: Tag[]
  selected: Set<number>
  onToggle: (id: number) => void
  legend: string
  hideLegend?: boolean
}) {
  const locale = useLocale()
  const t = useTranslations("tags")
  const count = tags.filter((tag) => selected.has(tag.id)).length

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className={cn("mb-3 flex w-full items-baseline justify-between gap-4", hideLegend && "sr-only")}>
        <span className="font-heading text-lg font-bold">{legend}</span>
        <span className="text-sm text-muted-foreground">{t("selected", { count })}</span>
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {tags.map((tag) => {
          const isOn = selected.has(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(tag.id)}
              className={cn(
                "press inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] transition-colors duration-200",
                isOn
                  ? "border-grape bg-plum font-medium text-foreground"
                  : "bg-card text-muted-foreground hover:border-primary hover:text-foreground"
              )}
            >
              {isOn && <Check className="pop size-4 text-spark" aria-hidden />}
              {tagLabel(tag, locale)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
