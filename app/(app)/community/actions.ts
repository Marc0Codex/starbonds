"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { type FeedTab, getFeed, getGroupFeed } from "@/lib/posts"
import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import { isOwnPath, POST_MAX_IMAGES } from "@/lib/uploads"

export type PostErrorKey = "postEmpty" | "postTooLong" | "tooManyImages" | "notMember" | "generic"

async function requireUser() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  return current
}

const postSchema = z
  .object({
    body: z.string().trim().max(2000, { error: "postTooLong" }),
    postType: z.enum(["general", "collaboration", "showcase"]),
    media: z.array(z.string()).max(POST_MAX_IMAGES, { error: "tooManyImages" }),
    groupId: z.uuid().nullable(),
  })
  .refine((v) => v.body.length > 0 || v.media.length > 0, { error: "postEmpty" })

export async function createPost(input: {
  body: string
  postType: string
  media: string[]
  groupId: string | null
}): Promise<{ error?: PostErrorKey; id?: string }> {
  const { userId } = await requireUser()
  const parsed = postSchema.safeParse(input)
  if (!parsed.success) return { error: (parsed.error.issues[0]?.message as PostErrorKey) ?? "generic" }
  if (!parsed.data.media.every((path) => isOwnPath(path, userId))) return { error: "generic" }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: userId,
      body: parsed.data.body,
      post_type: parsed.data.postType,
      media: parsed.data.media,
      group_id: parsed.data.groupId,
    })
    .select("id")
    .single()
  // RLS rejects posts into groups the user hasn't joined.
  if (error || !data) return { error: error?.code === "42501" ? "notMember" : "generic" }

  revalidatePath("/community", "layout")
  return { id: data.id }
}

export async function deletePost(postId: string) {
  const { userId } = await requireUser()
  const supabase = await createClient()
  const { data: post } = await supabase
    .from("posts")
    .select("media")
    .eq("id", postId)
    .eq("author_id", userId)
    .maybeSingle()
  if (!post) return { error: "generic" as const }

  const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", userId)
  if (error) return { error: "generic" as const }

  const media = post.media.filter((path) => isOwnPath(path, userId))
  if (media.length) await supabase.storage.from("artworks").remove(media)
  revalidatePath("/community", "layout")
  return { ok: true as const }
}

export async function setLike(postId: string, liked: boolean) {
  const { userId } = await requireUser()
  const supabase = await createClient()
  const { error } = liked
    ? await supabase.from("likes").upsert({ post_id: postId, profile_id: userId }, { ignoreDuplicates: true })
    : await supabase.from("likes").delete().eq("post_id", postId).eq("profile_id", userId)
  return { ok: !error }
}

export async function addComment(postId: string, body: string) {
  const { userId } = await requireUser()
  const text = body.trim()
  if (!text || text.length > 1000) return { error: "generic" as const }
  const supabase = await createClient()
  const { error } = await supabase.from("comments").insert({ post_id: postId, author_id: userId, body: text })
  if (error) return { error: "generic" as const }
  revalidatePath(`/posts/${postId}`)
  return { ok: true as const }
}

export async function deleteComment(commentId: string, postId: string) {
  await requireUser()
  const supabase = await createClient()
  // RLS allows the comment author or the post author.
  const { error } = await supabase.from("comments").delete().eq("id", commentId)
  if (error) return { error: "generic" as const }
  revalidatePath(`/posts/${postId}`)
  return { ok: true as const }
}

export async function setFollow(targetId: string, follow: boolean) {
  const { userId } = await requireUser()
  if (targetId === userId) return { ok: false }
  const supabase = await createClient()
  const { error } = follow
    ? await supabase
        .from("follows")
        .upsert({ follower_id: userId, following_id: targetId }, { ignoreDuplicates: true })
    : await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", targetId)
  return { ok: !error }
}

export async function loadMoreFeed(tab: FeedTab, cursor: string) {
  const { userId } = await requireUser()
  return getFeed(tab, userId, cursor)
}

export async function loadMoreGroupFeed(groupId: string, before: string) {
  const { userId } = await requireUser()
  return getGroupFeed(groupId, userId, before)
}
