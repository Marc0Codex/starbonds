"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

export type SwipeResult =
  | { ok: true; match: null }
  | { ok: true; match: { id: string; conversationId: string | null } }
  | { ok: false }

export async function recordSwipe(targetId: string, direction: "like" | "pass"): Promise<SwipeResult> {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  if (targetId === current.userId) return { ok: false }

  const supabase = await createClient()
  const { error } = await supabase
    .from("swipes")
    .insert({ swiper_id: current.userId, target_id: targetId, direction })
  if (error) {
    // Already swiped: only `direction` is updatable (column-level grant).
    if (error.code !== "23505") return { ok: false }
    const { error: updateError } = await supabase
      .from("swipes")
      .update({ direction })
      .eq("swiper_id", current.userId)
      .eq("target_id", targetId)
    if (updateError) return { ok: false }
  }
  if (direction === "pass") return { ok: true, match: null }

  // A database trigger creates the match (and its conversation) on mutual likes.
  const [a, b] = [current.userId, targetId].sort()
  const { data: match } = await supabase
    .from("matches")
    .select("id, conversation_id")
    .eq("user_a", a)
    .eq("user_b", b)
    .maybeSingle()

  if (match) revalidatePath("/match")
  return { ok: true, match: match ? { id: match.id, conversationId: match.conversation_id } : null }
}
