"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { loadMoreFeed, loadMoreGroupFeed } from "@/app/(app)/community/actions"
import { Star } from "@/components/brand/star"
import { PostCard } from "@/components/community/post-card"
import { Button } from "@/components/ui/button"
import type { FeedPost, FeedTab } from "@/lib/posts"

type Source = { kind: "feed"; tab: FeedTab } | { kind: "group"; groupId: string }

export function FeedList({
  initialPosts,
  initialCursor,
  source,
  now,
  canInteract = true,
}: {
  initialPosts: FeedPost[]
  initialCursor: string | null
  source: Source
  now: number
  canInteract?: boolean
}) {
  const t = useTranslations("community")
  const [posts, setPosts] = useState(initialPosts)
  const [cursor, setCursor] = useState(initialCursor)
  const [pending, startTransition] = useTransition()

  // A new server render (e.g. after publishing) replaces the list.
  const [seed, setSeed] = useState(initialPosts)
  if (seed !== initialPosts) {
    setSeed(initialPosts)
    setPosts(initialPosts)
    setCursor(initialCursor)
  }

  function loadMore() {
    if (!cursor) return
    startTransition(async () => {
      try {
        const page =
          source.kind === "feed"
            ? await loadMoreFeed(source.tab, cursor)
            : await loadMoreGroupFeed(source.groupId, cursor)
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id))
          return [...prev, ...page.posts.filter((p) => !seen.has(p.id))]
        })
        setCursor(page.nextCursor)
      } catch {
        toast.error(t("errors.generic"))
      }
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {posts.map((post, i) => (
        <div
          key={post.id}
          className="rise-in"
          style={{ "--delay": `${Math.min(i % 12, 6) * 60}ms` } as React.CSSProperties}
        >
          <PostCard
            post={post}
            now={now}
            canInteract={canInteract}
            onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        </div>
      ))}

      {cursor ? (
        <Button type="button" variant="outline" size="lg" onClick={loadMore} disabled={pending} className="self-center">
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {t("loadMore")}
        </Button>
      ) : (
        posts.length > 0 && (
          <p className="flex items-center justify-center gap-3 py-6 text-muted-foreground">
            <Star className="size-4 text-primary" />
            {t("endOfFeed")}
          </p>
        )
      )}
    </div>
  )
}
