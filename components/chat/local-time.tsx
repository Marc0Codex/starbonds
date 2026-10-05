"use client"

import { useLocale } from "next-intl"
import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

// Absolute times render in the viewer's own time zone, so they only appear after hydration.
export function LocalTime({ iso, withDate = false, className }: { iso: string; withDate?: boolean; className?: string }) {
  const locale = useLocale()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  if (!mounted) return <time dateTime={iso} className={className} />

  const date = new Date(iso)
  const sameDay = date.toDateString() === new Date().toDateString()
  const text = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    ...(withDate && !sameDay ? { day: "numeric", month: "short" } : {}),
  }).format(date)

  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  )
}
