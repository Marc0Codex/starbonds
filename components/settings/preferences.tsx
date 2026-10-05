"use client"

import { Laptop, Moon, Sun } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useSyncExternalStore, useTransition } from "react"

import { setLocale } from "@/app/(app)/settings/actions"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
] as const

export function Preferences() {
  const t = useTranslations("settings")
  const locale = useLocale()
  const { theme, setTheme } = useTheme()
  const [pending, startTransition] = useTransition()
  // Theme is only known on the client; avoid a hydration mismatch on the selected option.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const themes = [
    { value: "light", label: t("themeLight"), icon: Sun },
    { value: "dark", label: t("themeDark"), icon: Moon },
    { value: "system", label: t("themeSystem"), icon: Laptop },
  ]

  return (
    <div className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3" disabled={pending}>
        <legend className="mb-1 text-lg font-semibold">{t("language")}</legend>
        <p className="text-sm text-muted-foreground">{t("languageDescription")}</p>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map(({ value, label }) => (
            <OptionButton
              key={value}
              selected={locale === value}
              onClick={() => startTransition(() => setLocale(value))}
            >
              {label}
            </OptionButton>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">{t("theme")}</legend>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ value, label, icon: Icon }) => (
            <OptionButton key={value} selected={mounted && theme === value} onClick={() => setTheme(value)}>
              <Icon className="size-4" aria-hidden />
              {label}
            </OptionButton>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
        selected
          ? "border-primary bg-accent text-accent-foreground"
          : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
