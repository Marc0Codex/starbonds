import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { getCurrentProfile } from "@/lib/profile"

// Shareable pages (profiles, artworks) that also work for logged-out visitors.
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [current, t] = await Promise.all([getCurrentProfile(), getTranslations("public")])

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
    </div>
  )
}
