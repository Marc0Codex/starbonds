import { ArrowUpRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getLocale, getNow, getTranslations } from "next-intl/server"

import { Star } from "@/components/brand/star"
import { Composer } from "@/components/community/composer"
import { FeedList } from "@/components/community/feed-list"
import { buttonVariants } from "@/components/ui/button"
import { withDemoPosts } from "@/lib/demo"
import { type FeedTab, getFeed } from "@/lib/posts"
import { getCurrentProfile } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav")
  return { title: t("community") }
}

export default async function CommunityPage({ searchParams }: PageProps<"/community">) {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const { tab: tabParam } = await searchParams
  const tab: FeedTab = tabParam === "following" ? "following" : "discover"
  const [{ posts, nextCursor }, t, tNav] = await Promise.all([
    getFeed(tab, current.userId),
    getTranslations("community"),
    getTranslations("nav"),
  ])
  const now = (await getNow()).getTime()
  // Sample posts on the first Discover page (see lib/demo.ts).
  const visiblePosts = tab === "discover" ? withDemoPosts(posts, await getLocale(), now) : posts

  const tabs: { value: FeedTab; label: string }[] = [
    { value: "discover", label: t("tabDiscover") },
    { value: "following", label: t("tabFollowing") },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="rise-in flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">{tNav("community")}</h1>
        <Link href="/community/groups" className={cn(buttonVariants({ variant: "outline" }), "press")}>
          {t("groups")}
          <ArrowUpRight aria-hidden />
        </Link>
      </header>

      <nav aria-label={t("feedTabs")} className="flex gap-8 border-b">
        {tabs.map(({ value, label }) => {
          const active = tab === value
          return (
            <Link
              key={value}
              href={value === "discover" ? "/community" : "/community?tab=following"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px min-h-12 border-b-2 pb-3 pt-2 text-[17px] transition-colors duration-200",
                active ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <Composer
        userId={current.userId}
        user={{
          displayName: current.profile.display_name,
          avatarUrl: publicUrl("avatars", current.profile.avatar_path),
        }}
      />

      {visiblePosts.length > 0 ? (
        <FeedList key={tab} initialPosts={visiblePosts} initialCursor={nextCursor} source={{ kind: "feed", tab }} now={now} />
      ) : (
        <div className="relative flex flex-col items-start gap-5 overflow-hidden rounded-[28px] border border-dashed p-8 sm:p-12">
          <Star spin className="absolute -right-12 -top-12 size-48 text-raise" />
          <h2 className="relative text-[clamp(2rem,5vw,3rem)] font-extrabold leading-none">
            {tab === "discover" ? t("emptyDiscoverTitle") : t("emptyFollowingTitle")}{" "}
            <span className="serif-accent text-primary">
              {tab === "discover" ? t("emptyDiscoverAccent") : t("emptyFollowingAccent")}
            </span>
          </h2>
          <p className="relative max-w-md text-lg text-muted-foreground">
            {tab === "discover" ? t("emptyDiscoverBody") : t("emptyFollowingBody")}
          </p>
          {tab === "following" && (
            <Link href="/community" className={cn(buttonVariants(), "press relative")}>
              {t("goDiscover")}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
