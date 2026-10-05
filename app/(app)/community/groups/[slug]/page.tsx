import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getTranslations, getNow } from "next-intl/server"

import { Star } from "@/components/brand/star"
import { Composer } from "@/components/community/composer"
import { FeedList } from "@/components/community/feed-list"
import { MembershipButton } from "@/components/community/membership-button"
import { getGroupBySlug } from "@/lib/groups"
import { getGroupFeed } from "@/lib/posts"
import { getCurrentProfile } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"

export async function generateMetadata({ params }: PageProps<"/community/groups/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const current = await getCurrentProfile()
  if (!current) return {}
  const data = await getGroupBySlug(slug, current.userId)
  return data ? { title: data.group.name, description: data.group.description ?? undefined } : {}
}

export default async function GroupPage({ params }: PageProps<"/community/groups/[slug]">) {
  const { slug } = await params
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const data = await getGroupBySlug(slug, current.userId)
  if (!data) notFound()
  const { group, isMember, isOwner } = data

  const [{ posts, nextCursor }, t] = await Promise.all([
    getGroupFeed(group.id, current.userId),
    getTranslations("groups"),
  ])
  const now = (await getNow()).getTime()

  return (
    <div className="flex flex-col gap-10">
      <Link href="/community/groups" className="flex items-center gap-2 self-start text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>

      <header className="relative flex flex-col gap-6 overflow-hidden rounded-[32px] bg-plum p-8 sm:p-12">
        <Star spin className="absolute -right-16 -top-16 size-64 text-grape" />
        <div className="relative flex flex-col gap-3">
          <p className="eyebrow !text-spark">{t("members", { count: group.members_count })}</p>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[0.95]">{group.name}</h1>
          {group.description && <p className="max-w-xl whitespace-pre-line text-lg leading-relaxed">{group.description}</p>}
        </div>
        <div className="relative">
          {isOwner ? (
            <span className="inline-flex rounded-full bg-background/40 px-4 py-2 text-sm">{t("owner")}</span>
          ) : (
            <MembershipButton groupId={group.id} slug={group.slug} isMember={isMember} />
          )}
        </div>
      </header>

      {isMember ? (
        <Composer
          userId={current.userId}
          groupId={group.id}
          user={{
            displayName: current.profile.display_name,
            avatarUrl: publicUrl("avatars", current.profile.avatar_path),
          }}
        />
      ) : (
        <p className="rounded-[24px] border border-dashed p-6 text-muted-foreground">{t("joinToPost")}</p>
      )}

      {posts.length > 0 ? (
        <FeedList
          initialPosts={posts}
          initialCursor={nextCursor}
          source={{ kind: "group", groupId: group.id }}
          now={now}
        />
      ) : (
        <p className="text-lg text-muted-foreground">{t("emptyPosts")}</p>
      )}
    </div>
  )
}
