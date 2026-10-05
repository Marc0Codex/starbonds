"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"

import { createClient } from "@/lib/supabase/client"
import { authorizeRealtime } from "@/lib/supabase/realtime"

// Refreshes server data (nav unread badge, inbox) when a new message arrives.
// Realtime applies RLS, so only messages from the user's conversations come through.
export function UnreadListener({ meId }: { meId: string }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const channel = supabase.channel(`inbox:${meId}`)
    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      if ((payload.new as { sender_id: string }).sender_id === meId) return
      clearTimeout(timer)
      timer = setTimeout(() => router.refresh(), 400)
    })
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
