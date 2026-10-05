import "server-only"

import { createClient } from "@/lib/supabase/server"

export const MESSAGE_PAGE_SIZE = 50

export type ChatMessage = { id: number; senderId: string; body: string; createdAt: string }

type Person = { id: string; username: string; displayName: string; avatarPath: string | null }

export type ConversationSummary = {
  id: string
  other: Person
  lastMessage: { body: string; fromMe: boolean; createdAt: string } | null
  unread: boolean
  updatedAt: string
}

const PEOPLE =
  "a:profiles!conversations_user_a_fkey(id, username, display_name, avatar_path), b:profiles!conversations_user_b_fkey(id, username, display_name, avatar_path)"

type ProfileRow = { id: string; username: string; display_name: string; avatar_path: string | null } | null

function person(row: ProfileRow): Person | null {
  return row ? { id: row.id, username: row.username, displayName: row.display_name, avatarPath: row.avatar_path } : null
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient()
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`id, user_a, user_b, a_last_read_at, b_last_read_at, last_message_at, created_at, ${PEOPLE}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100)
  if (!conversations?.length) return []

  // Latest message per conversation (one query, newest first).
  const { data: recent } = await supabase
    .from("messages")
    .select("conversation_id, sender_id, body, created_at")
    .in(
      "conversation_id",
      conversations.map((c) => c.id)
    )
    .order("created_at", { ascending: false })
    .limit(400)
  const last = new Map<string, NonNullable<typeof recent>[number]>()
  for (const message of recent ?? []) if (!last.has(message.conversation_id)) last.set(message.conversation_id, message)

  return conversations.flatMap((c) => {
    const isA = c.user_a === userId
    const other = person(isA ? c.b : c.a)
    if (!other) return []
    const myRead = isA ? c.a_last_read_at : c.b_last_read_at
    const message = last.get(c.id)
    return [
      {
        id: c.id,
        other,
        lastMessage: message
          ? { body: message.body, fromMe: message.sender_id === userId, createdAt: message.created_at }
          : null,
        unread: Boolean(c.last_message_at && c.last_message_at > myRead && message?.sender_id !== userId),
        updatedAt: c.last_message_at ?? c.created_at,
      },
    ]
  })
}

export async function getConversation(id: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("conversations")
    .select(`id, user_a, user_b, ${PEOPLE}, listing:listings!conversations_listing_id_fkey(id, title)`)
    .eq("id", id)
    .maybeSingle()
  if (!data) return null
  const other = person(data.user_a === userId ? data.b : data.a)
  // The listing this chat started from (marketplace "contact the artist").
  return other ? { id: data.id, other, listing: data.listing } : null
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_PAGE_SIZE)
  return (data ?? [])
    .map((m) => ({ id: m.id, senderId: m.sender_id, body: m.body, createdAt: m.created_at }))
    .reverse()
}

// Light query for the nav badge. Sending a message bumps the sender's own read
// time (DB trigger), so last_message_at > my read time means someone else wrote.
export async function getUnreadCount(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("conversations")
    .select("user_a, a_last_read_at, b_last_read_at, last_message_at")
    .not("last_message_at", "is", null)
  return (data ?? []).filter((c) => c.last_message_at! > (c.user_a === userId ? c.a_last_read_at : c.b_last_read_at))
    .length
}
