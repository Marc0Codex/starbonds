import { STAR_PATH } from "@/components/brand/star-path"
import { cn } from "@/lib/utils"

// The STARBONDS four-point star: brand mark, Match icon and celebration glyph.
export { STAR_PATH }

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
