"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export type PleiMood = "idle" | "happy" | "meh" | "celebrate" | "sleepy"

// Five-point star body (center 100,108), drawn from the virtualpet reference art.
const BODY =
  "M100 20 L123.5 75.6 L183.7 80.8 L138 120.4 L151.7 179.2 L100 148 L48.3 179.2 L62 120.4 L16.3 80.8 L76.5 75.6 Z"
const INK = "#1a1015"
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
  const joyful = mood === "happy" || mood === "celebrate"

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
              <g transform="rotate(-6 100 108)">
                <path d={BODY} fill="#ffe36a" stroke={INK} strokeWidth="9" strokeLinejoin="round" />
                <path
                  d={BODY}
                  fill="none"
                  stroke="#f2c230"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  transform="translate(7 7.56) scale(0.93)"
                />

                {joyful && (
                  <g fill="#f59eb5" opacity="0.55">
                    <ellipse cx="78" cy="126" rx="7" ry="4.5" />
                    <ellipse cx="124" cy="126" rx="7" ry="4.5" />
                  </g>
                )}

                {/* eyes */}
                {sleepy ? (
                  <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
                    <path d="M82 112 q7 6 14 0" />
                    <path d="M106 112 q7 6 14 0" />
                  </g>
                ) : mood === "celebrate" ? (
                  <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M82 115 l7 -8 l7 8" />
                    <path d="M106 115 l7 -8 l7 8" />
                  </g>
                ) : (
                  <g transform={`translate(${look.x} ${look.y})`}>
                    <g className="plei-blink">
                      <ellipse cx="89" cy="111" rx="6.5" ry="9" fill={INK} />
                      <ellipse cx="113" cy="111" rx="6.5" ry="9" fill={INK} />
                      <circle cx="87" cy="107.5" r="2.4" fill="#fff" />
                      <circle cx="111" cy="107.5" r="2.4" fill="#fff" />
                    </g>
                  </g>
                )}

                {/* mouth */}
                {joyful ? (
                  <path d="M88 126 Q101 146 116 126 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
                ) : mood === "meh" ? (
                  <path d="M90 133 q5 -4 11 0 t11 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
                ) : sleepy ? (
                  <ellipse cx="101" cy="132" rx="4" ry="5" fill={INK} />
                ) : (
                  <path d="M88 127 Q101 140 115 127" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
                )}
              </g>

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
            <path
              d="M16 1 C17 11 21 15 31 16 C21 17 17 21 16 31 C15 21 11 17 1 16 C11 15 15 11 16 1 Z"
              fill="currentColor"
            />
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
