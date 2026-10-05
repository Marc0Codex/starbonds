import { Handshake, Sparkles, Store } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function LandingPage() {
  const t = await getTranslations("landing")

  const features = [
    { icon: Sparkles, title: t("featureVisibilityTitle"), body: t("featureVisibilityBody") },
    { icon: Store, title: t("featureMarketTitle"), body: t("featureMarketBody") },
    { icon: Handshake, title: t("featureMatchTitle"), body: t("featureMatchBody") },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
          {t("ctaSecondary")}
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 pb-16 pt-10 sm:px-6 sm:pt-20">
        <section className="flex max-w-3xl flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">{t("eyebrow")}</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">{t("title")}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("subtitle")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base")}>
              {t("ctaPrimary")}
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-6 text-base")}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article key={title} className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground" aria-hidden>
                <Icon className="size-5" />
              </span>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
