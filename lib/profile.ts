import "server-only"

import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type Tag = Tables<"tags">
export type Profile = Tables<"profiles">
export type Artwork = Tables<"artworks">

// Signed-in user's profile, deduped per request.
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub as string | undefined
  if (!userId) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return profile ? { userId, profile } : null
})

export const getAllTags = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.from("tags").select("*").order("id")
  return data ?? []
})

export async function getProfileTagIds(profileId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("profile_tags").select("tag_id").eq("profile_id", profileId)
  return (data ?? []).map((row) => row.tag_id)
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*, profile_tags(tags(*))")
    .eq("username", username.toLowerCase())
    .maybeSingle()
  if (!data) return null

  const { profile_tags, ...profile } = data
  const tags = profile_tags.map((row) => row.tags).filter((tag): tag is Tag => Boolean(tag))
  return { profile, tags }
}

export async function getArtworksByOwner(ownerId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("artworks")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
  return data ?? []
}
