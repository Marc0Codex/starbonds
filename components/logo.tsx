import { Star } from "@/components/brand/star"
import { cn } from "@/lib/utils"

export function Logo({ className, spin = true }: { className?: string; spin?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-heading text-xl font-extrabold tracking-tight", className)}>
      <Star spin={spin} className="size-7 text-primary" />
      STARBONDS
    </span>
  )
}
