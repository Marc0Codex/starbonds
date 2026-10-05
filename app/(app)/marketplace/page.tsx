import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SectionPlaceholder } from "@/components/shell/section-placeholder"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav")
  return { title: t("marketplace") }
}

export default function Page() {
  return <SectionPlaceholder section="marketplace" />
}
