// Plei's artwork (SVG, viewBox 0 0 200 200), drawn from the virtualpet reference.
// Pure and dependency-free: used by the app mascot and by the promo video (video/).

export type PleiMood = "idle" | "happy" | "meh" | "celebrate" | "sleepy"

// Five-point star body centered at (100, 108).
export const PLEI_BODY =
  "M100 20 L123.5 75.6 L183.7 80.8 L138 120.4 L151.7 179.2 L100 148 L48.3 179.2 L62 120.4 L16.3 80.8 L76.5 75.6 Z"
const INK = "#1a1015"

export function PleiArt({
  mood = "idle",
  lookX = 0,
  lookY = 0,
  eyeScale = 1,
  blinkClassName,
}: {
  mood?: PleiMood
  /** Pupil offset in SVG units (about ±3.5). */
  lookX?: number
  lookY?: number
  /** Vertical eye scale for frame-driven blinking (1 = open). */
  eyeScale?: number
  /** CSS class for time-based blinking in the app. */
  blinkClassName?: string
}) {
  const sleepy = mood === "sleepy"
  const joyful = mood === "happy" || mood === "celebrate"

  return (
    <g transform="rotate(-6 100 108)">
      <path d={PLEI_BODY} fill="#ffe36a" stroke={INK} strokeWidth="9" strokeLinejoin="round" />
      <path
        d={PLEI_BODY}
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
        <g transform={`translate(${lookX} ${lookY})`}>
          <g
            className={blinkClassName}
            transform={eyeScale === 1 ? undefined : `translate(0 ${111 * (1 - eyeScale)}) scale(1 ${eyeScale})`}
          >
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
  )
}
