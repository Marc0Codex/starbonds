"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"

import { createClient } from "@/lib/supabase/client"
import { authorizeRealtime } from "@/lib/supabase/realtime"

// Refreshes server data (nav badges, inbox, activity) when a message or notification arrives.
// Realtime applies RLS, so only messages from the user's conversations come through.
export function UnreadListener({ meId }: { meId: string }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const channel = supabase.channel(`inbox:${meId}`)
    const refreshSoon = () => {
      clearTimeout(timer)
      timer = setTimeout(() => router.refresh(), 400)
    }
    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      if ((payload.new as { sender_id: string }).sender_id !== meId) refreshSoon()
    })
    // New notifications (likes, comments, follows, matches, group joins) update the Activity badge.
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${meId}` },
      refreshSoon
    )
    void authorizeRealtime(supabase).then(() => {
      if (active) channel.subscribe()
    })
    return () => {
      active = false
      clearTimeout(timer)
      void supabase.removeChannel(channel)
    }
  }, [supabase, meId, router])

  return null
}
