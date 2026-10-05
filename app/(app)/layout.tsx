import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { BottomNav, MobileHeader, Sidebar } from "@/components/shell/app-nav"
import { publicUrl } from "@/lib/storage"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_path")
    .eq("id", userId)
    .single()
  if (!profile) redirect("/login")

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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-10">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
