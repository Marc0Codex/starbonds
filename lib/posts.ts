import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export const FEED_PAGE_SIZE = 12
// Authors below this many followers get the "new voice" badge.
export const NEW_VOICE_MAX_FOLLOWERS = 25

export type FeedTab = "discover" | "following"

export type FeedPost = {
  id: string
  body: string
  media: string[]
  postType: Tables<"posts">["post_type"]
  createdAt: string
  likesCount: number
  commentsCount: number
  liked: boolean
  isOwn: boolean
  author: { id: string; username: string; displayName: string; avatarPath: string | null; newVoice: boolean }
  group: { slug: string; name: string } | null
  /** Present only on sample posts from lib/demo.ts (local likes, no post page). */
  demo?: { artSeed: string | null }
}

export type FeedComment = {
  id: string
  body: string
  createdAt: string
  canDelete: boolean
  author: { username: string; displayName: string; avatarPath: string | null }
}

const POST_EMBED =
  "*, author:profiles!posts_author_id_fkey(id, username, display_name, avatar_path, followers_count), group:groups!posts_group_id_fkey(slug, name)"

type PostRow = Tables<"posts"> & {
  author: Pick<Tables<"profiles">, "id" | "username" | "display_name" | "avatar_path" | "followers_count"> | null
  group: Pick<Tables<"groups">, "slug" | "name"> | null
}

async function likedSet(postIds: string[], userId: string | null) {
  if (!userId || !postIds.length) return new Set<string>()
  const supabase = await createClient()
  const { data } = await supabase.from("likes").select("post_id").eq("profile_id", userId).in("post_id", postIds)
  return new Set((data ?? []).map((row) => row.post_id))
}

async function toFeedPosts(rows: PostRow[], userId: string | null): Promise<FeedPost[]> {
  const liked = await likedSet(
    rows.map((r) => r.id),
    userId
  )
  return rows
    .filter((row) => row.author)
    .map((row) => ({
      id: row.id,
      body: row.body,
      media: row.media,
      postType: row.post_type,
      createdAt: row.created_at,
      likesCount: row.likes_count,
      commentsCount: row.comments_count,
      liked: liked.has(row.id),
      isOwn: row.author_id === userId,
      author: {
        id: row.author!.id,
        username: row.author!.username,
        displayName: row.author!.display_name,
        avatarPath: row.author!.avatar_path,
        newVoice: row.author!.followers_count < NEW_VOICE_MAX_FOLLOWERS,
      },
      group: row.group,
    }))
}

// cursor: offset (discover) or created_at of the last post (following / group)
export async function getFeed(tab: FeedTab, userId: string, cursor?: string) {
  const supabase = await createClient()
  const query =
    tab === "discover"
      ? supabase.rpc("get_discover_feed", { p_limit: FEED_PAGE_SIZE, p_offset: Number(cursor ?? 0) || 0 })
      : supabase.rpc("get_following_feed", { p_limit: FEED_PAGE_SIZE, p_before: cursor ?? undefined })
  const { data } = await query.select(POST_EMBED)
  let rows = (data ?? []) as unknown as PostRow[]
  const pageSize = rows.length

  // Discover excludes your own posts; surface the ones you just published on top.
  if (tab === "discover" && !cursor) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: own } = await supabase
      .from("posts")
      .select(POST_EMBED)
      .eq("author_id", userId)
      .is("group_id", null)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(3)
    rows = [...((own ?? []) as unknown as PostRow[]), ...rows]
  }

  const posts = await toFeedPosts(rows, userId)
  const nextCursor =
    pageSize < FEED_PAGE_SIZE
      ? null
      : tab === "discover"
        ? String((Number(cursor ?? 0) || 0) + FEED_PAGE_SIZE)
        : posts[posts.length - 1].createdAt
  return { posts, nextCursor }
}

export async function getGroupFeed(groupId: string, userId: string | null, before?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("posts")
    .select(POST_EMBED)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE)
  if (before) query = query.lt("created_at", before)
  const { data } = await query
  const posts = await toFeedPosts((data ?? []) as unknown as PostRow[], userId)
  return { posts, nextCursor: posts.length < FEED_PAGE_SIZE ? null : posts[posts.length - 1].createdAt }
}

export async function getUserPosts(authorId: string, userId: string | null) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("posts")
    .select(POST_EMBED)
    .eq("author_id", authorId)
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE)
  return toFeedPosts((data ?? []) as unknown as PostRow[], userId)
}

export async function getPost(id: string, userId: string | null) {
  const supabase = await createClient()
  const { data } = await supabase.from("posts").select(POST_EMBED).eq("id", id).maybeSingle()
  if (!data) return null
  const [post] = await toFeedPosts([data as unknown as PostRow], userId)
  return post ?? null
}

export async function getComments(postId: string, userId: string | null, postAuthorId: string): Promise<FeedComment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("comments")
    .select("*, author:profiles!comments_author_id_fkey(username, display_name, avatar_path)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(200)
  return (data ?? [])
    .filter((row) => row.author)
    .map((row) => ({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      canDelete: row.author_id === userId || postAuthorId === userId,
      author: {
        username: row.author!.username,
        displayName: row.author!.display_name,
        avatarPath: row.author!.avatar_path,
      },
    }))
}

export async function isFollowing(followerId: string, followingId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
  return (count ?? 0) > 0
}
