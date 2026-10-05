import { getTranslations } from "next-intl/server"

import { Star } from "@/components/brand/star"
import { NAV_ITEMS, type NavKey } from "@/lib/nav"

// Temporary empty state for sections built in later phases.
export async function SectionPlaceholder({ section }: { section: Exclude<NavKey, "profile"> }) {
  const tNav = await getTranslations("nav")
  const tSections = await getTranslations("sections")
  const tCommon = await getTranslations("common")
  const Icon = NAV_ITEMS.find((item) => item.key === section)!.icon

  return (
    <div className="flex flex-col gap-10">
      <h1 className="rise-in text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">{tNav(section)}</h1>
      <div
        className="rise-in relative flex flex-col items-start gap-5 overflow-hidden rounded-[28px] border border-dashed p-8 sm:p-12"
        style={{ "--delay": "0.1s" } as React.CSSProperties}
      >
        <Star spin className="absolute -right-10 -top-10 size-44 text-raise" />
        <span className="relative grid size-14 place-items-center rounded-2xl bg-plum" aria-hidden>
          <Icon className="size-6 text-primary" />
        </span>
        <p className="relative max-w-md text-lg leading-relaxed text-muted-foreground">
          {tSections(`${section}Description`)}
        </p>
        <span className="relative rounded-full bg-spark px-3.5 py-1.5 text-[13px] font-semibold text-spark-foreground">
          {tCommon("comingSoon")}
        </span>
      </div>
    </div>
  )
}
