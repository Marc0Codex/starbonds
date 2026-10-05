import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { GroupCreateForm } from "@/components/community/group-create-form"
import { listGroups } from "@/lib/groups"
import { getCurrentProfile } from "@/lib/profile"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("community")
  return { title: t("groups") }
}

export default async function GroupsPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  const [groups, t, tNav] = await Promise.all([listGroups(current.userId), getTranslations("groups"), getTranslations("nav")])

  return (
    <div className="flex flex-col gap-10">
      <Link href="/community" className="flex items-center gap-2 self-start text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        {tNav("community")}
      </Link>
      <header className="rise-in flex flex-col gap-3">
        <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">
          {t("title")} <span className="serif-accent text-primary">{t("accent")}</span>
        </h1>
        <p className="text-[17px] text-muted-foreground">{t("subtitle")}</p>
      </header>

      <GroupCreateForm />

      {groups.length === 0 ? (
        <p className="text-lg text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="border-t">
          {groups.map((group, i) => (
            <li
              key={group.id}
              className="rise-in"
              style={{ "--delay": `${Math.min(i, 8) * 50}ms` } as React.CSSProperties}
            >
              <Link
                href={`/community/groups/${group.slug}`}
                className="group flex flex-wrap items-center gap-x-8 gap-y-2 border-b px-2 py-7 transition-[padding,background-color] duration-300 hover:bg-card hover:pl-6"
              >
                <span className="serif-accent w-10 text-2xl text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
                  <span className="font-heading text-2xl font-bold tracking-tight">{group.name}</span>
                  {group.description && <span className="line-clamp-2 text-muted-foreground">{group.description}</span>}
                </span>
                <span className="text-sm text-muted-foreground">{t("members", { count: group.members_count })}</span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    group.isMember ? "bg-spark text-spark-foreground" : "border text-muted-foreground"
                  )}
                >
                  {group.isMember ? t("joined") : t("join")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
