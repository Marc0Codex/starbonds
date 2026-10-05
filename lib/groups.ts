import "server-only"

import { createClient } from "@/lib/supabase/server"

export async function listGroups(userId: string) {
  const supabase = await createClient()
  const [{ data: groups }, { data: memberships }] = await Promise.all([
    supabase.from("groups").select("*").order("members_count", { ascending: false }).order("created_at").limit(60),
    supabase.from("group_members").select("group_id").eq("profile_id", userId),
  ])
  const mine = new Set((memberships ?? []).map((m) => m.group_id))
  return (groups ?? []).map((group) => ({ ...group, isMember: mine.has(group.id) }))
}

export async function getGroupBySlug(slug: string, userId: string) {
  const supabase = await createClient()
  const { data: group } = await supabase.from("groups").select("*").eq("slug", slug).maybeSingle()
  if (!group) return null
  const { count } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", group.id)
    .eq("profile_id", userId)
  return { group, isMember: (count ?? 0) > 0, isOwner: group.owner_id === userId }
}
