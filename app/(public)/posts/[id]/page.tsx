import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, getNow } from "next-intl/server"
import { cache } from "react"

import { Comments } from "@/components/community/comments"
import { PostCard } from "@/components/community/post-card"
import { getComments, getPost } from "@/lib/posts"
import { getCurrentProfile } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const loadPost = cache(async (id: string) => {
  if (!UUID_RE.test(id)) return null
  const current = await getCurrentProfile()
  return getPost(id, current?.userId ?? null)
})

export async function generateMetadata({ params }: PageProps<"/posts/[id]">): Promise<Metadata> {
  const { id } = await params
  const post = await loadPost(id)
  if (!post) return {}
  const t = await getTranslations("community")
  return {
    title: t("postTitle", { name: post.author.displayName }),
    description: post.body.slice(0, 160) || undefined,
    openGraph: post.media[0] ? { images: [publicUrl("artworks", post.media[0]) ?? ""] } : undefined,
  }
}

export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params
  const [post, current] = await Promise.all([loadPost(id), getCurrentProfile()])
  if (!post) notFound()

  const userId = current?.userId ?? null
  const comments = await getComments(post.id, userId, post.author.id)
  const now = (await getNow()).getTime()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div className="rise-in">
        <PostCard post={post} now={now} linkToPost={false} canInteract={Boolean(userId)} />
      </div>
      <Comments postId={post.id} comments={comments} now={now} signedIn={Boolean(userId)} />
    </div>
  )
}
