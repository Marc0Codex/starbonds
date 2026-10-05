import { Globe, MapPin, Pencil, Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getLocale, getTranslations, getNow } from "next-intl/server"

import { Star } from "@/components/brand/star"
import { PostCard } from "@/components/community/post-card"
import { ListingCard } from "@/components/market/listing-card"
import { ArtworkGrid } from "@/components/profile/artwork-grid"
import { FollowButton } from "@/components/profile/follow-button"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { buttonVariants } from "@/components/ui/button"
import { getSellerListings } from "@/lib/listings"
import { getUserPosts, isFollowing } from "@/lib/posts"
import { getArtworksByOwner, getCurrentProfile, getProfileByUsername } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"
import { groupTags, tagLabel } from "@/lib/tags"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params
  const data = await getProfileByUsername(username)
  if (!data) return {}
  return {
    title: `${data.profile.display_name} (@${data.profile.username})`,
    description: data.profile.bio ?? undefined,
  }
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params
  const [data, current, locale, t, tt] = await Promise.all([
    getProfileByUsername(username),
    getCurrentProfile(),
    getLocale(),
    getTranslations("profile"),
    getTranslations("tags"),
  ])
  if (!data) notFound()

  const { profile, tags } = data
  const isOwn = current?.userId === profile.id
  const [artworks, posts, following, listings, tm] = await Promise.all([
    getArtworksByOwner(profile.id),
    getUserPosts(profile.id, current?.userId ?? null),
    current && !isOwn ? isFollowing(current.userId, profile.id) : Promise.resolve(false),
    getSellerListings(profile.id, isOwn),
    getTranslations("market"),
  ])
  const grouped = groupTags(tags)
  const now = (await getNow()).getTime()

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end gap-6">
          <div className="rise-in relative">
            <ProfileAvatar
              name={profile.display_name}
              src={publicUrl("avatars", profile.avatar_path)}
              className="size-28 text-3xl sm:size-36"
            />
            {profile.open_to_collab && (
              <span
                className="absolute -bottom-1 -right-1 grid size-11 place-items-center rounded-full border-4 border-background bg-spark text-spark-foreground"
                title={t("openToCollab")}
              >
                <Star spin className="size-5" />
                <span className="sr-only">{t("openToCollab")}</span>
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[0.95]">
              <span className="reveal">
                <span className="break-words">{profile.display_name}</span>
              </span>
            </h1>
            <p className="fade-in text-lg text-muted-foreground" style={{ "--delay": "0.3s" } as React.CSSProperties}>
              @{profile.username}
            </p>
          </div>
          {isOwn && (
            <div className="fade-in flex flex-col items-stretch gap-2" style={{ "--delay": "0.4s" } as React.CSSProperties}>
              <Link href="/profile/artworks/new" className={cn(buttonVariants(), "press")}>
                <Plus aria-hidden />
                {t("addArtwork")}
              </Link>
              <Link href="/profile/edit" className={cn(buttonVariants({ variant: "outline" }), "press")}>
                <Pencil aria-hidden />
                {t("edit")}
              </Link>
            </div>
          )}
          {!isOwn && current && (
            <div className="fade-in" style={{ "--delay": "0.4s" } as React.CSSProperties}>
              <FollowButton targetId={profile.id} initialFollowing={following} />
            </div>
          )}
        </div>

        <div
          className="fade-in grid gap-8 border-t pt-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
          style={{ "--delay": "0.5s" } as React.CSSProperties}
        >
          <div className="flex flex-col gap-5">
            {profile.bio && <p className="max-w-xl whitespace-pre-line text-lg leading-relaxed">{profile.bio}</p>}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-muted-foreground">
              <li>
                <strong className="font-semibold text-foreground">{t("followers", { count: profile.followers_count })}</strong>
              </li>
              <li>{t("following", { count: profile.following_count })}</li>
              {profile.location && (
                <li className="flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden />
                  {profile.location}
                </li>
              )}
              {profile.website && (
                <li>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                    className="flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                  >
                    <Globe className="size-4" aria-hidden />
                    {profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <dl className="flex flex-col gap-4">
            {(["medium", "style", "goal"] as const).map(
              (kind) =>
                grouped[kind].length > 0 && (
                  <div key={kind} className="flex flex-col gap-2">
                    <dt className="eyebrow">{tt(kind)}</dt>
                    <dd className="flex flex-wrap gap-2">
                      {grouped[kind].map((tag) => (
                        <span
                          key={tag.id}
                          className={cn(
                            "rounded-full px-3.5 py-1.5 text-sm",
                            kind === "medium" && "border border-grape bg-plum",
                            kind === "style" && "border bg-card",
                            kind === "goal" && "border border-primary/40 text-primary"
                          )}
                        >
                          {tagLabel(tag, locale)}
                        </span>
                      ))}
                    </dd>
                  </div>
                )
            )}
          </dl>
        </div>
      </section>

      <section className="flex flex-col gap-8" aria-labelledby="portfolio-title">
        <div className="flex items-baseline justify-between gap-4 border-b pb-4">
          <h2 id="portfolio-title" className="text-3xl font-extrabold sm:text-4xl">
            {t("portfolio")}
          </h2>
          <span className="text-muted-foreground">{t("artworksCount", { count: artworks.length })}</span>
        </div>

        {artworks.length > 0 ? (
          <ArtworkGrid artworks={artworks} />
        ) : isOwn ? (
          <div className="relative flex flex-col items-start gap-5 overflow-hidden rounded-[28px] border border-dashed p-8 sm:p-14">
            <Star spin className="absolute -right-12 -top-12 size-52 text-raise" />
            <h3 className="relative text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-none">
              {t("emptyOwnTitle")} <span className="serif-accent text-primary">{t("emptyOwnAccent")}</span>
            </h3>
            <p className="relative max-w-md text-lg text-muted-foreground">{t("emptyOwnBody")}</p>
            <Link href="/profile/artworks/new" className={cn(buttonVariants({ size: "lg" }), "press relative")}>
              <Plus aria-hidden />
              {t("addArtwork")}
            </Link>
          </div>
        ) : (
          <p className="text-lg text-muted-foreground">{t("emptyOther")}</p>
        )}
      </section>

      {listings.length > 0 && (
        <section className="flex flex-col gap-8" aria-labelledby="sale-title">
          <h2 id="sale-title" className="border-b pb-4 text-3xl font-extrabold sm:text-4xl">
            {tm("forSale")}
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
            {listings.map((listing, i) => (
              <li key={listing.id}>
                <ListingCard listing={listing} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {posts.length > 0 && (
        <section className="flex flex-col gap-8" aria-labelledby="posts-title">
          <h2 id="posts-title" className="border-b pb-4 text-3xl font-extrabold sm:text-4xl">
            {t("posts")}
          </h2>
          <div className="flex max-w-2xl flex-col gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} now={now} canInteract={Boolean(current)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
