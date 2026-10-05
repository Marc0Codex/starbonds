"use client"

import { useEffect } from "react"

import { markAllNotificationsRead } from "@/app/(app)/activity/actions"

// Marks notifications as read shortly after the Activity page is seen
// (new items keep their highlight for this visit).
export function MarkNotificationsRead({ hasUnread }: { hasUnread: boolean }) {
  useEffect(() => {
    if (!hasUnread) return
    const timer = setTimeout(() => void markAllNotificationsRead(), 1200)
    return () => clearTimeout(timer)
  }, [hasUnread])
  return null
}
