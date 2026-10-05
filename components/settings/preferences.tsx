"use client"

import { Check } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { setLocale } from "@/app/(app)/settings/actions"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
] as const

export function Preferences() {
  const t = useTranslations("settings")
  const locale = useLocale()
  const [pending, startTransition] = useTransition()

  return (
    <fieldset className="flex flex-col gap-4" disabled={pending}>
      <legend className="mb-1 font-heading text-lg font-bold">{t("language")}</legend>
      <p className="text-muted-foreground">{t("languageDescription")}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {LANGUAGES.map(({ value, label }) => {
          const selected = locale === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => startTransition(() => setLocale(value))}
              className={cn(
                "press flex min-h-12 items-center justify-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
                selected ? "border-grape bg-plum text-foreground" : "text-muted-foreground hover:bg-raise hover:text-foreground"
              )}
            >
              {selected && <Check className="pop size-4 text-spark" aria-hidden />}
              {label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
