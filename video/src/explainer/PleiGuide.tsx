import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { PleiAnimated } from "../components/PleiAnimated"
import { useLayout } from "../layout"
import { EASE_SWIPE } from "../timing"
import { ANCHORS, type Anchor, FLIGHT, flights, INTRO_PLEI_AT, MOODS, REACTIONS, SPARKS } from "./plei-path"
import { Sfx } from "./ui"

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Plei as a single layer above every scene: it waits at each scene's anchor and
 * flies in an arc (with a spin and a squash) to the next one during transitions,
 * which keeps the guide spatially continuous across cuts.
 */
export function PleiGuide() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { vertical, u, width, height } = useLayout()
  const anchors = ANCHORS[vertical ? "vertical" : "horizontal"]

  // Find the current anchor, or the flight in progress.
  let pos: Anchor = anchors.intro
  let lift = 0
  let spinDeg = 0
  let stretch = 0
  for (const f of flights) {
    if (frame < f.start) break
    const t = interpolate(frame, [f.start, f.start + FLIGHT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    const p = EASE_SWIPE(t)
    const a = anchors[f.from]
    const b = anchors[f.to]
    pos = {
      x: lerp(a.x, b.x, p),
      y: lerp(a.y, b.y, p),
      size: lerp(a.size, b.size, p),
      look: { x: lerp(a.look.x, b.look.x, p), y: lerp(a.look.y, b.look.y, p) },
    }
    if (t < 1) {
      const arc = Math.sin(Math.PI * p)
      lift = arc * height * 0.1
      spinDeg = p * 360 * (b.x >= a.x ? 1 : -1)
      stretch = arc
    }
  }

  const appear = spring({ frame: frame - INTRO_PLEI_AT, fps, config: { damping: 10, stiffness: 150 } })
  const mood = [...MOODS].reverse().find(([at]) => frame >= at)?.[1] ?? "happy"
  const sparksAt = [...SPARKS].reverse().find((at) => frame >= at)
  const size = pos.size * u

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {SPARKS.map((at) => (
        <Sfx key={at} at={at} name="sparkle" volume={0.5} />
      ))}
      {frame >= INTRO_PLEI_AT && (
      <div
        style={{
          position: "absolute",
          left: pos.x * width - size / 2,
          top: pos.y * height - size / 2 - lift,
          transform: `rotate(${spinDeg}deg) scale(${appear * (1 + stretch * 0.08)}, ${appear * (1 - stretch * 0.06)})`,
        }}
      >
        <PleiAnimated size={size} mood={mood} look={pos.look} reactions={REACTIONS} sparksAt={sparksAt} />
      </div>
      )}
    </AbsoluteFill>
  )
}
