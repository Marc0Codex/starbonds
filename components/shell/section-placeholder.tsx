import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { NAV_ITEMS, type NavKey } from "@/lib/nav"

// Temporary empty state for sections built in later phases.
export async function SectionPlaceholder({ section }: { section: NavKey }) {
  const tNav = await getTranslations("nav")
  const tSections = await getTranslations("sections")
  const tCommon = await getTranslations("common")
  const Icon = NAV_ITEMS.find((item) => item.key === section)!.icon

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{tNav(section)}</h1>
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground" aria-hidden>
          <Icon className="size-7" />
        </span>
        <p className="max-w-sm text-muted-foreground">{tSections(`${section}Description`)}</p>
        <Badge variant="secondary">{tCommon("comingSoon")}</Badge>
      </div>
    </div>
  )
}
