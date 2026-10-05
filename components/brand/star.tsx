import { cn } from "@/lib/utils"

// The STARBONDS four-point star: brand mark, Match icon and celebration glyph.
export const STAR_PATH =
  "M16 1 C17 11 21 15 31 16 C21 17 17 21 16 31 C15 21 11 17 1 16 C11 15 15 11 16 1 Z"

export function Star({
  className,
  spin = false,
  outline = false,
}: {
  className?: string
  spin?: boolean
  outline?: boolean
}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-6 shrink-0", spin && "spin-slow", className)}>
      <path
        d={STAR_PATH}
        fill={outline ? "none" : "currentColor"}
        stroke={outline ? "currentColor" : "none"}
        strokeWidth={outline ? 2.2 : 0}
        strokeLinejoin="round"
      />
    </svg>
  )
}
