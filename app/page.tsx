import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Reveal } from "@/components/brand/reveal"
import { Star } from "@/components/brand/star"
import { ArtTiles } from "@/components/landing/art-tiles"
import { PromoVideo } from "@/components/landing/promo-video"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function LandingPage() {
  const t = await getTranslations("landing")
  const tLegal = await getTranslations("legal")
  const mediums = t.raw("mediums") as string[]
  const line1 = t("line1").split(" ").length
  const line2 = t("line2").split(" ").length

  const features = [
    { n: "01", title: t("f1Title"), body: t("f1Body"), href: "/signup" },
    { n: "02", title: t("f2Title"), body: t("f2Body"), href: "/signup" },
    { n: "03", title: t("f3Title"), body: t("f3Body"), href: "#match" },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden">
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-10">
        <Link href="/" aria-label="STARBONDS">
          <Logo />
        </Link>
        <nav aria-label={t("navHow")} className="flex flex-wrap items-center gap-1">
          <a href="#como" className="hidden rounded-full px-4 py-3 text-[15px] text-muted-foreground transition-colors hover:text-foreground sm:block">
            {t("navHow")}
          </a>
          <a href="#match" className="hidden rounded-full px-4 py-3 text-[15px] text-muted-foreground transition-colors hover:text-foreground sm:block">
            {t("navMatch")}
          </a>
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            {t("signIn")}
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-7xl flex-wrap items-center gap-14 px-5 pb-20 pt-10 sm:px-10 sm:pt-20">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">
            <p className="eyebrow fade-in flex items-center gap-2.5" style={{ "--delay": "0.1s" } as React.CSSProperties}>
              <span className="pulse-dot inline-block size-2 rounded-full bg-spark" aria-hidden />
              {t("eyebrow")}
            </p>
            <h1 className="text-[clamp(3.25rem,8.4vw,7.75rem)] font-extrabold leading-[0.92]">
              <Reveal text={t("line1")} />
              <br />
              <Reveal text={t("line2")} start={line1} className="text-primary" />
              <br />
              <span className="text-[0.86em]">
                <Reveal text={t("line3")} start={line1 + line2} className="serif-accent" />
              </span>
            </h1>
            <p className="fade-in max-w-[32rem] text-lg leading-relaxed text-muted-foreground sm:text-[19px]">{t("subtitle")}</p>
            <div className="fade-in flex flex-wrap gap-3">
              <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "press")}>
                {t("ctaPrimary")}
                <ArrowRight aria-hidden />
              </Link>
              <a href="#como" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "press")}>
                {t("ctaSecondary")}
              </a>
            </div>
          </div>
          <ArtTiles labels={t.raw("tiles") as string[]} ariaLabel={t("artLabel")} />
        </section>

        {/* Mediums marquee */}
        <div aria-hidden className="overflow-hidden border-y py-5">
          <div className="marquee">
            {[...mediums, ...mediums].map((m, i) => (
              <span key={i} className="inline-flex items-center gap-7 whitespace-nowrap pr-7">
                <span className="font-heading text-3xl font-bold">{m}</span>
                <Star className="size-[18px] text-primary" />
              </span>
            ))}
          </div>
        </div>

        {/* Promo video */}
        <section aria-labelledby="video-title" className="mx-auto flex max-w-7xl flex-col gap-10 px-5 pt-28 sm:px-10">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">{t("videoEyebrow")}</p>
            <h2 id="video-title" className="text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-none">
              {t("videoTitle")} <span className="serif-accent text-primary">{t("videoAccent")}</span>
            </h2>
          </div>
          <PromoVideo label={t("videoLabel")} playLabel={t("videoPlay")} pauseLabel={t("videoPause")} />
        </section>

        {/* How it works */}
        <section id="como" className="mx-auto flex max-w-7xl flex-col gap-14 px-5 py-28 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-none">
              {t("howTitle")} <span className="serif-accent text-primary">{t("howAccent")}</span> {t("howEnd")}
            </h2>
            <p className="max-w-xs text-[17px] leading-relaxed text-muted-foreground">{t("howSubtitle")}</p>
          </div>
          <ol className="border-t">
            {features.map((f) => (
              <li key={f.n}>
                <a
                  href={f.href}
                  className="group flex flex-wrap items-center gap-x-14 gap-y-3 border-b px-2 py-9 transition-[padding,background-color] duration-400 ease-[var(--ease-out)] hover:bg-card hover:pl-7"
                >
                  <span className="serif-accent w-12 text-[28px] text-muted-foreground">{f.n}</span>
                  <span className="flex-[1_1_280px] font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold tracking-tight">{f.title}</span>
                  <span className="flex-[1_1_320px] text-[17px] leading-relaxed text-muted-foreground">{f.body}</span>
                  <ArrowRight
                    aria-hidden
                    className="size-7 transition-[transform,color] duration-400 group-hover:-rotate-45 group-hover:translate-x-1.5 group-hover:text-spark"
                  />
                </a>
              </li>
            ))}
          </ol>
        </section>

        {/* Match */}
        <section id="match" className="border-y bg-card">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-16 px-5 py-28 sm:px-10">
            <div className="flex min-w-0 flex-[1_1_360px] justify-center" aria-hidden>
              <div className="relative h-[400px] w-[300px]">
                <div className="deck-back absolute inset-0 flex flex-col justify-end gap-2 rounded-[28px] border bg-raise p-6">
                  <div className="size-14 rounded-full bg-spark" />
                  <span className="font-heading text-2xl font-bold">{t("deckBackName")}</span>
                  <span className="text-sm text-muted-foreground">{t("deckBackMeta")}</span>
                </div>
                <div className="deck-front absolute inset-0 flex flex-col justify-between rounded-[28px] border border-grape bg-plum p-6">
                  <span className="self-start rounded-full bg-spark px-3 py-1.5 text-[13px] font-semibold text-spark-foreground">
                    {t("deckShared")}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="size-16 rounded-full border-[3px] border-background bg-primary" />
                    <span className="font-heading text-[28px] font-extrabold">{t("deckFrontName")}</span>
                    <span className="text-[15px] opacity-80">{t("deckFrontMeta")}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-7">
              <p className="eyebrow !text-spark">{t("matchEyebrow")}</p>
              <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-none">
                {t("matchTitle")} <span className="serif-accent text-primary">{t("matchAccent")}</span>
              </h2>
              <p className="max-w-[32rem] text-lg leading-relaxed text-muted-foreground">{t("matchBody")}</p>
              <ul className="flex flex-col gap-3.5">
                {[t("matchPoint1"), t("matchPoint2"), t("matchPoint3")].map((point) => (
                  <li key={point} className="flex items-center gap-3.5 text-[17px]">
                    <span className="inline-block size-2.5 rotate-45 bg-primary" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 py-28 sm:px-10">
          <div className="relative flex flex-wrap items-end justify-between gap-10 overflow-hidden rounded-[36px] bg-primary p-[clamp(2.5rem,7vw,6rem)] text-primary-foreground">
            <Star spin className="absolute -right-10 -top-10 size-56 opacity-25" />
            <h2 className="max-w-3xl text-[clamp(2.75rem,7vw,6rem)] font-extrabold leading-[0.95]">
              {t("ctaTitle")} <span className="serif-accent">{t("ctaAccent")}</span> {t("ctaEnd")}
            </h2>
            <Link
              href="/signup"
              className="press relative inline-flex min-h-14 items-center gap-2.5 rounded-full bg-background px-8 text-[17px] font-semibold text-foreground hover:bg-spark hover:text-spark-foreground"
            >
              {t("ctaButton")}
              <ArrowRight aria-hidden className="size-[18px]" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-7xl flex-wrap justify-between gap-4 border-t px-5 pb-12 pt-8 text-sm text-muted-foreground sm:px-10">
        <span className="font-heading font-bold text-foreground">STARBONDS</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <span>{t("footer")} · ES / EN</span>
          <Link href="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
            {tLegal("privacyLink")}
          </Link>
        </span>
      </footer>
    </div>
  )
}
