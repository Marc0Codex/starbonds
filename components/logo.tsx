import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground" aria-hidden>
        <Sparkles className="size-4" />
      </span>
      STARBONDS
    </span>
  )
}
