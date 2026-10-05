"use client"

import { Heart, Loader2, MessageCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"

import { deletePost, setLike } from "@/app/(app)/community/actions"
import { GenerativeArt } from "@/components/brand/generative-art"
import { DemoBadge } from "@/components/demo-badge"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import type { FeedPost } from "@/lib/posts"
import { publicUrl } from "@/lib/storage"
import { cn } from "@/lib/utils"

const TYPE_KEY = { general: null, collaboration: "typeCollaboration", showcase: "typeShowcase" } as const

export function PostCard({
  post,
  now,
  linkToPost = true,
  canInteract = true,
  onDeleted,
}: {
  post: FeedPost
  now: number
  linkToPost?: boolean
  canInteract?: boolean
  onDeleted?: (id: string) => void
}) {
  const t = useTranslations("community")
  const format = useFormatter()
  const [likeState, setLikeState] = useState({ liked: post.liked, count: post.likesCount })
  const [optimistic, setOptimistic] = useOptimistic(likeState)
  const [, startLike] = useTransition()
  const [armed, setArmed] = useState(false)
  const [deleting, startDelete] = useTransition()

  const typeKey = TYPE_KEY[post.postType]
  const isDemo = Boolean(post.demo)
  const postHref = `/posts/${post.id}`
  const profileHref = isDemo ? null : `/u/${post.author.username}`
  const createdAt = new Date(post.createdAt)

  function toggleLike() {
    const next = { liked: !optimistic.liked, count: optimistic.count + (optimistic.liked ? -1 : 1) }
    // Demo posts (lib/demo.ts) only like locally.
    if (post.demo) return setLikeState(next)
    startLike(async () => {
      setOptimistic(next)
      const { ok } = await setLike(post.id, next.liked)
      if (ok) setLikeState(next)
      else toast.error(t("errors.generic"))
    })
  }

  function onDelete() {
    if (!armed) return setArmed(true)
    startDelete(async () => {
      const result = await deletePost(post.id)
      if ("ok" in result) {
        toast.success(t("deleted"))
        onDeleted?.(post.id)
      } else toast.error(t("errors.generic"))
    })
  }

  return (
    <article
      className={cn(
        "flex flex-col gap-4 border-b pb-8 transition-opacity duration-300",
        deleting && "pointer-events-none opacity-40"
      )}
    >
      <header className="flex items-center gap-3">
        <MaybeLink href={profileHref} className="shrink-0 rounded-full">
          <ProfileAvatar
            name={post.author.displayName}
            src={publicUrl("avatars", post.author.avatarPath)}
            className="size-11"
          />
        </MaybeLink>
        <div className="flex min-w-0 flex-1 flex-col">
          <MaybeLink href={profileHref} className="truncate font-semibold hover:text-primary">
            {post.author.displayName}
          </MaybeLink>
          <p className="truncate text-sm text-muted-foreground">
            @{post.author.username} ·{" "}
            <time dateTime={post.createdAt}>{format.relativeTime(createdAt, now)}</time>
            {post.group && (
              <>
                {" · "}
                <Link href={`/community/groups/${post.group.slug}`} className="text-primary hover:underline">
                  {t("inGroup", { group: post.group.name })}
                </Link>
              </>
            )}
          </p>
        </div>
        {isDemo && <DemoBadge className="shrink-0" />}
        {post.author.newVoice && !post.isOwn && !isDemo && (
          <span className="shrink-0 rounded-full bg-spark px-2.5 py-1 text-xs font-semibold text-spark-foreground">
            {t("newVoice")}
          </span>
        )}
      </header>

      {typeKey && (
        <span
          className={cn(
            "self-start rounded-full px-3 py-1 text-[13px] font-medium",
            post.postType === "collaboration" ? "border border-grape bg-plum" : "border border-primary/40 text-primary"
          )}
        >
          {t(typeKey)}
        </span>
      )}

      {post.body &&
        (post.postType === "collaboration" ? (
          <p className="whitespace-pre-line font-heading text-2xl font-bold leading-snug tracking-tight">{post.body}</p>
        ) : (
          <p className="whitespace-pre-line text-[17px] leading-relaxed">{post.body}</p>
        ))}

      {post.demo?.artSeed && (
        <div className="relative aspect-[4/5] max-h-[560px] overflow-hidden rounded-[24px] border">
          <GenerativeArt seed={post.demo.artSeed} />
        </div>
      )}

      {post.media.length > 0 && (
        <div
          className={cn(
            "grid gap-1.5 overflow-hidden rounded-[24px] border",
            post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {post.media.map((path, i) => (
            <MediaLink key={path} href={linkToPost ? postHref : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrl("artworks", path) ?? ""}
                alt={t("postImage", { n: i + 1 })}
                loading="lazy"
                decoding="async"
                className={cn(
                  "block w-full bg-card object-cover",
                  post.media.length === 1 ? "max-h-[640px]" : "aspect-square",
                  post.media.length === 3 && i === 0 && "row-span-2 h-full"
                )}
              />
            </MediaLink>
          ))}
        </div>
      )}

      <footer className="-ml-3 flex items-center gap-1">
        <button
          type="button"
          onClick={toggleLike}
          disabled={!canInteract}
          aria-pressed={optimistic.liked}
          aria-label={t("like")}
          className={cn(
            "press flex min-h-11 items-center gap-2 rounded-full px-3 text-[15px] transition-colors",
            optimistic.liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart
            key={String(optimistic.liked)}
            className={cn("size-[22px]", optimistic.liked && "pop fill-primary")}
            aria-hidden
          />
          <span className="tabular-nums">{optimistic.count}</span>
          <span className="sr-only">{t("likesCount", { count: optimistic.count })}</span>
        </button>

        {linkToPost && !isDemo ? (
          <Link
            href={postHref}
            className="press flex min-h-11 items-center gap-2 rounded-full px-3 text-[15px] text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="size-[22px]" aria-hidden />
            {t("comments", { count: post.commentsCount })}
          </Link>
        ) : (
          <span className="flex min-h-11 items-center gap-2 px-3 text-[15px] text-muted-foreground">
            <MessageCircle className="size-[22px]" aria-hidden />
            {t("comments", { count: post.commentsCount })}
          </span>
        )}

        {post.isOwn && (
          <button
            type="button"
            onClick={onDelete}
            onBlur={() => setArmed(false)}
            disabled={deleting}
            className={cn(
              "press ml-auto flex min-h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors",
              armed ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
            {armed ? t("confirmDelete") : t("deletePost")}
          </button>
        )}
      </footer>
    </article>
  )
}

// Demo authors have no profile page, so their name renders as plain text.
function MaybeLink({ href, className, children }: { href: string | null; className: string; children: React.ReactNode }) {
  if (!href) return <span className={className}>{children}</span>
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

function MediaLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <div className="contents">{children}</div>
  return (
    <Link href={href} className="block overflow-hidden [&>img]:transition-transform [&>img]:duration-700 hover:[&>img]:scale-[1.02]">
      {children}
    </Link>
  )
}
