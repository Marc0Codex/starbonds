"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { STAR_PATH } from "@/components/brand/star-path"
import { PleiArt, type PleiMood } from "@/components/plei/plei-art"
import { cn } from "@/lib/utils"

export type { PleiMood }

const MOOD_ANIMATION: Partial<Record<PleiMood, string>> = {
  happy: "plei-hop",
  meh: "plei-shrug",
  celebrate: "plei-celebrate",
}

type Spark = { id: number; x: number; y: number }

/**
 * Plei — STARBONDS' constellation mascot.
 * Eyes follow the pointer, blinks, reacts to `mood` changes and bounces when petted.
 */
export function Plei({
  mood = "idle",
  message,
  size = 132,
  bubbleSide = "right",
  onPet,
  className,
}: {
  mood?: PleiMood
  message?: string | null
  size?: number
  bubbleSide?: "right" | "top"
  onPet?: () => void
  className?: string
}) {
  const t = useTranslations("plei")
  const svgRef = useRef<SVGSVGElement>(null)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [anim, setAnim] = useState<{ cls: string; key: number }>({ cls: "", key: 0 })
  const [sparks, setSparks] = useState<Spark[]>([])

  // Replay the reaction animation whenever the mood changes.
  const [prevMood, setPrevMood] = useState(mood)
  if (prevMood !== mood) {
    setPrevMood(mood)
    const cls = MOOD_ANIMATION[mood]
    if (cls) setAnim((a) => ({ cls, key: a.key + 1 }))
  }

  // Eyes follow the pointer (max ~3.5px).
  useEffect(() => {
    let frame = 0
    function onMove(event: PointerEvent) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = svgRef.current?.getBoundingClientRect()
        if (!rect) return
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        const dist = Math.hypot(dx, dy) || 1
        const reach = Math.min(1, dist / 240) * 3.5
        setLook({ x: (dx / dist) * reach, y: (dy / dist) * reach })
      })
    }
    window.addEventListener("pointermove", onMove)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  function pet() {
    setAnim((a) => ({ cls: "plei-bounce", key: a.key + 1 }))
    const burst = Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.6
      const dist = 46 + Math.random() * 26
      return { id: Date.now() + i, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
    })
    setSparks((prev) => [...prev, ...burst])
    const ids = new Set(burst.map((s) => s.id))
    setTimeout(() => setSparks((prev) => prev.filter((s) => !ids.has(s.id))), 850)
    onPet?.()
  }

  const sleepy = mood === "sleepy"

  return (
    <div
      className={cn(
        "relative flex items-center gap-4",
        bubbleSide === "top" && "flex-col-reverse",
        className
      )}
    >
      <button
        type="button"
        onClick={pet}
        aria-label={t("petLabel")}
        className="relative shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        style={{ width: size, height: size }}
      >
        <span className={cn("block size-full", sleepy ? "plei-sleep" : "plei-float")}>
          <span key={anim.key} className={cn("block size-full", anim.cls)}>
            <svg ref={svgRef} viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden>
              <PleiArt mood={mood} lookX={look.x} lookY={look.y} blinkClassName="plei-blink" />

              {sleepy && (
                <g fill="#bfa8ff" fontFamily="var(--font-syne)" fontWeight="800">
                  <text x="150" y="60" fontSize="22" className="plei-z">z</text>
                  <text x="162" y="40" fontSize="16" className="plei-z" style={{ "--delay": "1.2s" } as React.CSSProperties}>
                    z
                  </text>
                </g>
              )}
            </svg>
          </span>
        </span>

        {sparks.map((s) => (
          <svg
            key={s.id}
            viewBox="0 0 32 32"
            aria-hidden
            className="plei-spark pointer-events-none absolute left-1/2 top-1/2 -ml-2 -mt-2 size-4 text-spark"
            style={{ "--sx": `${s.x}px`, "--sy": `${s.y}px` } as React.CSSProperties}
          >
            <path d={STAR_PATH} fill="currentColor" />
          </svg>
        ))}
      </button>

      {message && (
        <p
          key={message}
          aria-live="polite"
          className={cn(
            "rise-in relative max-w-64 rounded-[20px] border bg-card px-4 py-3 text-[15px] leading-snug",
            bubbleSide === "right" ? "rounded-bl-md" : "rounded-b-md text-center"
          )}
        >
          <span className="serif-accent mr-1 text-primary">Plei:</span>
          {message}
        </p>
      )}
    </div>
  )
}
