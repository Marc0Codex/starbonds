import { cn } from "@/lib/utils"

// Word-by-word masked reveal. `start` offsets the stagger so several lines chain.
export function Reveal({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  const words = text.split(" ")
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="reveal">
            <span className={cn(className)} style={{ "--d": start + i } as React.CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  )
}
