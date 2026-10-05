"use client"

import { Bell, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { signOut } from "@/app/(auth)/actions"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { isActive, NAV_ITEMS } from "@/lib/nav"
import { cn } from "@/lib/utils"

export type ShellUser = { displayName: string; username: string; avatarUrl: string | null }

export function Sidebar({ user }: { user: ShellUser }) {
  const t = useTranslations("nav")
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar px-3 py-5 md:flex">
      <Link href="/community" className="px-3 pb-6" aria-label="STARBONDS">
        <Logo />
      </Link>
      <nav aria-label={t("mainNavigation")} className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("size-5", active && "text-primary")} aria-hidden />
              {t(key)}
            </Link>
          )
        })}
      </nav>
      <div className="flex items-center gap-3 rounded-lg border bg-card p-2">
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label={t("signOut")}
            title={t("signOut")}
          >
            <LogOut aria-hidden />
          </button>
        </form>
      </div>
    </aside>
  )
}

export function MobileHeader() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur pt-[env(safe-area-inset-top)] md:hidden">
      <Link href="/community" aria-label="STARBONDS">
        <Logo className="text-lg" />
      </Link>
      <div className="flex items-center gap-1">
        {[
          { href: "/activity", icon: Bell, label: t("activity") },
          { href: "/settings", icon: Settings, label: t("settings") },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive(pathname, href) ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-lg" }),
              "size-11",
              isActive(pathname, href) && "text-primary"
            )}
          >
            <Icon className="size-5" aria-hidden />
          </Link>
        ))}
      </div>
    </header>
  )
}

export function BottomNav() {
  const t = useTranslations("nav")
  const pathname = usePathname()

  return (
    <nav
      aria-label={t("mainNavigation")}
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ key, href, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden />
                {t(key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function UserAvatar({ user }: { user: ShellUser }) {
  return (
    <Avatar className="size-9">
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
