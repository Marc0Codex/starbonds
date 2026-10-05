import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { LocalTime } from "@/components/chat/local-time"
import { Plei } from "@/components/plei/plei"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { buttonVariants } from "@/components/ui/button"
import { listConversations } from "@/lib/messages"
import { getCurrentProfile } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav")
  return { title: t("messages") }
}

export default async function MessagesPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const [conversations, t, tNav] = await Promise.all([
    listConversations(current.userId),
    getTranslations("chat"),
    getTranslations("nav"),
  ])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="rise-in text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">{tNav("messages")}</h1>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-start gap-6 rounded-[28px] border border-dashed p-8 sm:p-12">
          <Plei mood="sleepy" size={96} />
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold leading-none">
            {t("emptyTitle")} <span className="serif-accent text-primary">{t("emptyAccent")}</span>
          </h2>
          <p className="max-w-md text-lg text-muted-foreground">{t("emptyBody")}</p>
          <Link href="/match" className={cn(buttonVariants(), "press")}>
            {t("goMatch")}
          </Link>
        </div>
      ) : (
        <ul className="border-t">
          {conversations.map((c, i) => (
            <li key={c.id} className="rise-in" style={{ "--delay": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-center gap-4 border-b px-2 py-5 transition-[background-color,padding] duration-300 hover:bg-card hover:pl-4"
              >
                <ProfileAvatar
                  name={c.other.displayName}
                  src={publicUrl("avatars", c.other.avatarPath)}
                  className="size-14"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={cn("truncate font-heading text-lg", c.unread ? "font-extrabold" : "font-bold")}>
                      {c.other.displayName}
                    </span>
                    <LocalTime iso={c.updatedAt} withDate className="shrink-0 text-xs text-muted-foreground" />
                  </span>
                  <span className={cn("truncate text-[15px]", c.unread ? "text-foreground" : "text-muted-foreground")}>
                    {c.lastMessage ? (
                      <>
                        {c.lastMessage.fromMe && <span className="mr-1">{t("you")}</span>}
                        {c.lastMessage.body}
                      </>
                    ) : (
                      <span className="serif-accent text-primary">{t("noMessagesYet")}</span>
                    )}
                  </span>
                </span>
                {c.unread && (
                  <span className="size-2.5 shrink-0 rounded-full bg-spark">
                    <span className="sr-only">{t("unread")}</span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
