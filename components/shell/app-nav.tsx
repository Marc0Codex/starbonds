"use client"

import { Bell, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { signOut } from "@/app/(auth)/actions"
import { Logo } from "@/components/logo"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { buttonVariants } from "@/components/ui/button"
import { isActive, NAV_ITEMS } from "@/lib/nav"
import { cn } from "@/lib/utils"

export type ShellUser = { displayName: string; username: string; avatarUrl: string | null }

function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null
  return (
    <span
      className={cn(
        "pop grid min-w-5 place-items-center rounded-full bg-spark px-1.5 text-[11px] font-bold leading-5 text-spark-foreground",
        className
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  )
}

export function Sidebar({ user, unread = 0, activity = 0 }: { user: ShellUser; unread?: number; activity?: number }) {
  const badges: Partial<Record<string, number>> = { messages: unread, activity }
  const t = useTranslations("nav")
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r px-4 py-7 md:flex">
      <Link href="/community" className="px-3 pb-10" aria-label="STARBONDS">
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
                "group flex min-h-12 items-center gap-3.5 rounded-2xl px-4 text-[15px] font-medium transition-[background-color,color,padding] duration-300",
                active ? "bg-plum text-foreground" : "text-muted-foreground hover:bg-card hover:pl-5 hover:text-foreground"
              )}
            >
              <Icon className={cn("size-5", active && "text-primary")} />
              {t(key)}
              {(badges[key] ?? 0) > 0 ? (
                <UnreadBadge count={badges[key] ?? 0} className="ml-auto" />
              ) : (
                active && <span className="ml-auto size-1.5 rounded-full bg-spark" aria-hidden />
              )}
            </Link>
          )
        })}
      </nav>
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-2.5">
        <ProfileAvatar name={user.displayName} src={user.avatarUrl} />
        <Link href="/profile" className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        </Link>
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

export function MobileHeader({ activity = 0 }: { activity?: number }) {
  const t = useTranslations("nav")
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] backdrop-blur-md md:hidden">
      <Link href="/community" aria-label="STARBONDS">
        <Logo className="text-lg" />
      </Link>
      <div className="flex items-center">
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
              buttonVariants({ variant: "ghost", size: "icon" }),
              isActive(pathname, href) && "text-primary"
            )}
          >
            <span className="relative">
              <Icon className="size-[22px]" aria-hidden />
              {href === "/activity" && <UnreadBadge count={activity} className="absolute -right-3 -top-2" />}
            </span>
          </Link>
        ))}
      </div>
    </header>
  )
}

export function BottomNav({ unread = 0 }: { unread?: number }) {
  const t = useTranslations("nav")
  const pathname = usePathname()

  return (
    <nav
      aria-label={t("mainNavigation")}
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-30 rounded-[26px] border bg-card/95 p-1.5 backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ key, href, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[20px] text-[11px] font-medium transition-colors duration-300",
                  active ? "bg-plum font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative">
                  <Icon className="size-[22px]" />
                  {key === "messages" && <UnreadBadge count={unread} className="absolute -right-3 -top-2" />}
                </span>
                {t(key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
