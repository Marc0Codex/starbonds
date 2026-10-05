import { Heart, MessageCircle, UserPlus, Users } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getFormatter, getNow, getTranslations } from "next-intl/server"

import { MarkNotificationsRead } from "@/components/activity/mark-read"
import { Star } from "@/components/brand/star"
import { Plei } from "@/components/plei/plei"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { getNotifications } from "@/lib/activity"
import { getCurrentProfile } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav")
  return { title: t("activity") }
}

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  group_join: Users,
} as const

export default async function ActivityPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const [items, t, tNav, format, now] = await Promise.all([
    getNotifications(),
    getTranslations("activity"),
    getTranslations("nav"),
    getFormatter(),
    getNow(),
  ])
  const hasUnread = items.some((item) => item.unread)

  return (
    <div className="flex flex-col gap-8">
      <MarkNotificationsRead hasUnread={hasUnread} />
      <h1 className="rise-in text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">{tNav("activity")}</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-6 rounded-[28px] border border-dashed p-8 sm:p-12">
          <Plei mood="sleepy" size={96} />
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold leading-none">
            {t("emptyTitle")} <span className="serif-accent text-primary">{t("emptyAccent")}</span>
          </h2>
          <p className="max-w-md text-lg text-muted-foreground">{t("emptyBody")}</p>
        </div>
      ) : (
        <ul className="border-t">
          {items.map((item, i) => {
            const Icon = item.type === "match" ? null : ICONS[item.type]
            const name = item.actor?.displayName ?? t("someone")
            const action =
              item.type === "group_join"
                ? t("group_join", { group: item.extra ?? t("groupFallback") })
                : t(item.type)
            return (
              <li key={item.id} className="rise-in" style={{ "--delay": `${Math.min(i, 10) * 35}ms` } as React.CSSProperties}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 border-b px-2 py-4 transition-[background-color,padding] duration-300 hover:bg-card hover:pl-4",
                    item.unread && "bg-plum/30"
                  )}
                >
                  <span className="relative shrink-0">
                    <ProfileAvatar
                      name={name}
                      src={publicUrl("avatars", item.actor?.avatarPath)}
                      className="size-12"
                    />
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-background",
                        item.type === "match" ? "bg-spark text-spark-foreground" : "bg-primary text-primary-foreground"
                      )}
                      aria-hidden
                    >
                      {Icon ? <Icon className="size-3" /> : <Star className="size-3.5" />}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] leading-snug">
                    <span className="font-semibold">{name}</span> <span className="text-muted-foreground">{action}</span>
                    <span className="block text-sm text-muted-foreground">
                      {format.relativeTime(new Date(item.createdAt), now)}
                    </span>
                  </span>
                  {item.unread && (
                    <span className="shrink-0 rounded-full bg-spark px-2 py-0.5 text-[11px] font-bold uppercase text-spark-foreground">
                      {t("new")}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
