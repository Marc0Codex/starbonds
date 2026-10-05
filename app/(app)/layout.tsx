import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { BottomNav, MobileHeader, Sidebar } from "@/components/shell/app-nav"
import { getCurrentProfile } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  if (!current.profile.onboarded) redirect("/onboarding")

  const { profile } = current
  const t = await getTranslations("nav")
  const user = {
    displayName: profile.display_name,
    username: profile.username,
    avatarUrl: publicUrl("avatars", profile.avatar_path),
  }

  return (
    <div className="flex flex-1">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 pb-32 pt-6 md:px-10 md:pb-12 md:pt-12">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
