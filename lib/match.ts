import "server-only"

import { createClient } from "@/lib/supabase/server"

export type Candidate = {
  id: string
  username: string
  displayName: string
  avatarPath: string | null
  bio: string | null
  location: string | null
  tagIds: number[]
  sharedTagIds: number[]
  coverPath: string | null
}

export type MatchSummary = {
  id: string
  conversationId: string | null
  createdAt: string
  other: { username: string; displayName: string; avatarPath: string | null }
}

export async function getCandidates(limit = 20): Promise<Candidate[]> {
  const supabase = await createClient()
  const { data } = await supabase.rpc("get_match_candidates", { p_limit: limit })
  const rows = data ?? []
  if (!rows.length) return []

  // Latest artwork per candidate becomes the card cover: art first, faces second.
  const { data: artworks } = await supabase
    .from("artworks")
    .select("owner_id, images, created_at")
    .in(
      "owner_id",
      rows.map((r) => r.id)
    )
    .order("created_at", { ascending: false })
  const covers = new Map<string, string>()
  for (const artwork of artworks ?? []) {
    if (!covers.has(artwork.owner_id) && artwork.images[0]) covers.set(artwork.owner_id, artwork.images[0])
  }

  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarPath: row.avatar_path,
    bio: row.bio,
    location: row.location,
    tagIds: row.tag_ids ?? [],
    sharedTagIds: row.shared_tag_ids ?? [],
    coverPath: covers.get(row.id) ?? null,
  }))
}

export async function getMatches(userId: string): Promise<MatchSummary[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("matches")
    .select(
      "id, conversation_id, created_at, a:profiles!matches_user_a_fkey(id, username, display_name, avatar_path), b:profiles!matches_user_b_fkey(id, username, display_name, avatar_path)"
    )
    .order("created_at", { ascending: false })
    .limit(30)

  return (data ?? []).flatMap((row) => {
    const other = row.a?.id === userId ? row.b : row.a
    if (!other) return []
    return [
      {
        id: row.id,
        conversationId: row.conversation_id,
        createdAt: row.created_at,
        other: { username: other.username, displayName: other.display_name, avatarPath: other.avatar_path },
      },
    ]
  })
}
