import { Star } from "@/components/brand/star"
import { cn } from "@/lib/utils"

// Outline star sized like a lucide icon, for navigation.
export function StarIcon({ className }: { className?: string }) {
  return <Star outline className={cn("size-[22px]", className)} />
}
