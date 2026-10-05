import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type ActivityItem = {
  id: number
  type: Tables<"notifications">["type"]
  createdAt: string
  unread: boolean
  href: string
  extra: string | null
  actor: { username: string; displayName: string; avatarPath: string | null } | null
}

export async function getNotifications(limit = 60): Promise<ActivityItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("notifications")
    .select("*, actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_path)")
    .order("created_at", { ascending: false })
    .limit(limit)
  const rows = data ?? []

  // Resolve link targets that need a lookup (match → conversation, group → slug).
  const matchIds = rows.filter((r) => r.type === "match" && r.entity_id).map((r) => r.entity_id!)
  const groupIds = rows.filter((r) => r.type === "group_join" && r.entity_id).map((r) => r.entity_id!)
  const [{ data: matches }, { data: groups }] = await Promise.all([
    matchIds.length
      ? supabase.from("matches").select("id, conversation_id").in("id", matchIds)
      : Promise.resolve({ data: [] as { id: string; conversation_id: string | null }[] }),
    groupIds.length
      ? supabase.from("groups").select("id, slug, name").in("id", groupIds)
      : Promise.resolve({ data: [] as { id: string; slug: string; name: string }[] }),
  ])
  const conversationByMatch = new Map((matches ?? []).map((m) => [m.id, m.conversation_id]))
  const groupById = new Map((groups ?? []).map((g) => [g.id, g]))

  return rows.map((row) => {
    const actor = row.actor
      ? { username: row.actor.username, displayName: row.actor.display_name, avatarPath: row.actor.avatar_path }
      : null
    let href = "/activity"
    let extra: string | null = null
    switch (row.type) {
      case "like":
      case "comment":
        href = row.entity_id ? `/posts/${row.entity_id}` : href
        break
      case "follow":
        href = actor ? `/u/${actor.username}` : href
        break
      case "match": {
        const conversation = row.entity_id ? conversationByMatch.get(row.entity_id) : null
        href = conversation ? `/messages/${conversation}` : "/match"
        break
      }
      case "group_join": {
        const group = row.entity_id ? groupById.get(row.entity_id) : null
        href = group ? `/community/groups/${group.slug}` : "/community/groups"
        extra = group?.name ?? null
        break
      }
    }
    return { id: row.id, type: row.type, createdAt: row.created_at, unread: !row.read_at, href, extra, actor }
  })
}

export async function getUnreadNotificationsCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null)
  return count ?? 0
}

export async function getBlockedUsers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blocks")
    .select("blocked_id, created_at, blocked:profiles!blocks_blocked_id_fkey(username, display_name, avatar_path)")
    .order("created_at", { ascending: false })
  return (data ?? []).flatMap((row) =>
    row.blocked
      ? [
          {
            id: row.blocked_id,
            username: row.blocked.username,
            displayName: row.blocked.display_name,
            avatarPath: row.blocked.avatar_path,
          },
        ]
      : []
  )
}

export async function isBlocking(blockerId: string, blockedId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from("blocks")
    .select("*", { count: "exact", head: true })
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId)
  return (count ?? 0) > 0
}
