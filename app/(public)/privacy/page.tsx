import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { PRIVACY_UPDATED, privacySections } from "@/components/legal/privacy-content"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal")
  return { title: t("privacyTitle"), description: t("privacyDescription") }
}

export default async function PrivacyPage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("legal")])
  const sections = privacySections(locale)
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(PRIVACY_UPDATED))

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-12">
      <header className="rise-in flex flex-col gap-4">
        <p className="eyebrow">{t("updated", { date: updated })}</p>
        <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-[0.95]">
          {t("privacyHeading")} <span className="serif-accent text-primary">{t("privacyAccent")}</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{t("privacyIntro")}</p>
      </header>

      <nav aria-label={t("contents")} className="rounded-[24px] border bg-card p-6">
        <p className="eyebrow mb-3">{t("contents")}</p>
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="flex gap-3 py-1 hover:text-primary">
                <span className="serif-accent w-6 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((s, i) => (
        <section key={s.id} id={s.id} className="flex scroll-mt-28 flex-col gap-4 border-t pt-8">
          <h2 className="flex items-baseline gap-4 text-2xl font-extrabold sm:text-3xl">
            <span className="serif-accent text-xl font-normal text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            {s.title}
          </h2>
          {s.body.map((block, j) =>
            Array.isArray(block) ? (
              <ul key={j} className="flex flex-col gap-2.5 pl-1">
                {block.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed text-muted-foreground">
                    <span className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p key={j} className="leading-relaxed text-muted-foreground">
                {block}
              </p>
            )
          )}
        </section>
      ))}
    </article>
  )
}
