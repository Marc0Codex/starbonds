import { AbsoluteFill, random, useCurrentFrame } from "remotion"

import { STAR_PATH } from "../../../components/brand/star-path"
import { useLayout } from "../layout"
import { C } from "../theme"

const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: random(`x${i}`),
  y: random(`y${i}`),
  depth: 0.3 + random(`d${i}`) * 0.7,
  size: 6 + random(`s${i}`) * 18,
  phase: random(`p${i}`) * Math.PI * 2,
  shape: random(`k${i}`) > 0.72 ? "star" : "dot",
  spark: random(`c${i}`) > 0.86,
}))

// Opaque parallax backdrop. Each scene renders it with its absolute start frame as
// `offset`, so the field stays continuous across transitions.
export function StarField({ offset = 0 }: { offset?: number }) {
  const frame = useCurrentFrame() + offset
  const { width, height } = useLayout()

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      {STARS.map((s, i) => {
        const drift = (frame * 0.9 * s.depth) % (height + 100)
        const y = ((s.y * (height + 100) - drift + height + 100) % (height + 100)) - 50
        const x = s.x * width + Math.sin(frame / 60 + s.phase) * 12 * s.depth
        const twinkle = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(frame / 14 + s.phase))
        const color = s.spark ? C.spark : s.depth > 0.75 ? C.lavender : C.grape
        const size = s.size * s.depth
        return s.shape === "star" ? (
          <svg
            key={i}
            viewBox="0 0 32 32"
            width={size * 1.6}
            height={size * 1.6}
            style={{ position: "absolute", left: x, top: y, opacity: twinkle, transform: `rotate(${frame * 0.6 * s.depth}deg)` }}
          >
            <path d={STAR_PATH} fill={color} />
          </svg>
        ) : (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: 999,
              backgroundColor: color,
              opacity: twinkle * 0.8,
            }}
          />
        )
      })}
    </AbsoluteFill>
  )
}
