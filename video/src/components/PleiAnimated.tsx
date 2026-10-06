import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { STAR_PATH } from "../../../components/brand/star-path"
import { PleiArt, type PleiMood } from "../../../components/plei/plei-art"
import { C } from "../theme"

type Reaction = { at: number; kind: "hop" | "spin" | "bounce" }

// Frame-driven Plei: floats, blinks, looks around and plays reactions at given frames.
export function PleiAnimated({
  size,
  mood,
  reactions = [],
  sparksAt,
  look = { x: 0, y: 0 },
}: {
  size: number
  mood: PleiMood
  reactions?: Reaction[]
  sparksAt?: number
  look?: { x: number; y: number }
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const float = Math.sin(frame / 14) * size * 0.05
  const sway = Math.sin(frame / 18) * 5

  // Blink every ~70 frames for 4 frames.
  const cycle = frame % 70
  const eyeScale = cycle >= 60 && cycle < 64 ? 0.12 : 1

  let jump = 0
  let spin = 0
  let squashX = 1
  let squashY = 1
  for (const r of reactions) {
    const p = spring({ frame: frame - r.at, fps, config: { damping: 11, stiffness: 140 } })
    const arc = Math.sin(Math.min(1, Math.max(0, (frame - r.at) / 18)) * Math.PI)
    if (frame < r.at) continue
    if (r.kind === "hop") jump += arc * size * 0.22
    if (r.kind === "bounce") {
      squashX *= 1 + arc * 0.12
      squashY *= 1 - arc * 0.1
      jump += arc * size * 0.1
    }
    if (r.kind === "spin") {
      spin += p * 360
      jump += arc * size * 0.18
    }
  }

  const sparkT = sparksAt === undefined ? -1 : (frame - sparksAt) / 22

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          width: size,
          height: size,
          transform: `translateY(${float - jump}px) rotate(${sway + spin}deg) scale(${squashX}, ${squashY})`,
          transformOrigin: "50% 60%",
        }}
      >
        <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: "visible" }}>
          <PleiArt mood={mood} lookX={look.x} lookY={look.y} eyeScale={eyeScale} />
        </svg>
      </div>
      {sparkT >= 0 &&
        sparkT <= 1 &&
        Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2 + 0.3
          const dist = interpolate(sparkT, [0, 1], [size * 0.2, size * 0.85])
          const s = size * 0.13 * (1 - sparkT * 0.6)
          return (
            <svg
              key={i}
              viewBox="0 0 32 32"
              width={s}
              height={s}
              style={{
                position: "absolute",
                left: size / 2 + Math.cos(angle) * dist - s / 2,
                top: size / 2 + Math.sin(angle) * dist - s / 2,
                opacity: 1 - sparkT,
                transform: `rotate(${sparkT * 120}deg)`,
              }}
            >
              <path d={STAR_PATH} fill={i % 2 ? C.spark : C.lavender} />
            </svg>
          )
        })}
    </div>
  )
}
