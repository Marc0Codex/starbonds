import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { getCurrentProfile } from "@/lib/profile"

// Shareable pages (profiles, artworks) that also work for logged-out visitors.
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [current, t, tLegal, tQr] = await Promise.all([
    getCurrentProfile(),
    getTranslations("public"),
    getTranslations("legal"),
    getTranslations("qr"),
  ])

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-10">
          <Link href={current ? "/community" : "/"} aria-label="STARBONDS">
            <Logo className="text-lg" />
          </Link>
          {current ? (
            <Link href="/community" className={buttonVariants({ variant: "outline" })}>
              {t("openApp")}
            </Link>
          ) : (
            <Link href="/signup" className={buttonVariants()}>
              {t("join")}
            </Link>
          )}
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-10 sm:px-10 sm:pt-14">
        {children}
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-4 border-t px-5 py-8 text-sm text-muted-foreground sm:px-10">
        <span className="font-heading font-bold text-foreground">STARBONDS</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/qr" className="underline-offset-4 hover:text-foreground hover:underline">
            {tQr("link")}
          </Link>
          <Link href="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
            {tLegal("privacyLink")}
          </Link>
        </span>
      </footer>
    </div>
  )
}
