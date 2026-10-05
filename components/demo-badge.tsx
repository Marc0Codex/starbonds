import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

// Marks sample content from lib/demo.ts.
export function DemoBadge({ className }: { className?: string }) {
  const t = useTranslations("demo")
  return (
    <span
      title={t("hint")}
      className={cn(
        "rounded-full border border-foreground/30 bg-background/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm",
        className
      )}
    >
      {t("badge")}
    </span>
  )
}
