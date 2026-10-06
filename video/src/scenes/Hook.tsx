import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { StarGlyph } from "../components/Brand"
import { KineticWords } from "../components/KineticWords"
import { useLayout } from "../layout"
import { C, FONT } from "../theme"
import { EASE_OUT } from "../timing"

// 0–2.8 s: the star spins in, bursts into sparks, then "Tu arte, visto." lands word by word.
export function Hook() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { vertical, u, width, height } = useLayout()

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 120 } })
  const rise = interpolate(frame, [22, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })
  const starSize = 300 * u * (1 - rise * 0.62)
  const starY = interpolate(rise, [0, 1], [0, -(vertical ? 360 : 250) * u])
  const burst = interpolate(frame, [20, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const zoom = interpolate(frame, [0, 85], [1, 1.06])
  const titleSize = (vertical ? 148 : 170) * u

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${zoom})` }}>
      {/* spark burst */}
      {burst > 0 &&
        burst < 1 &&
        Array.from({ length: 14 }, (_, i) => {
          const angle = (i / 14) * Math.PI * 2
          const dist = burst * Math.max(width, height) * 0.42
          const s = 40 * u * (1 - burst * 0.7)
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: width / 2 + Math.cos(angle) * dist - s / 2,
                top: height / 2 + starY + Math.sin(angle) * dist - s / 2,
                opacity: 1 - burst,
              }}
            >
              <StarGlyph size={s} color={i % 3 === 0 ? C.lavender : C.spark} />
            </div>
          )
        })}

      <div
        style={{
          position: "absolute",
          transform: `translateY(${starY}px) rotate(${(1 - enter) * -540 + frame * 1.2}deg) scale(${enter})`,
        }}
      >
        <StarGlyph size={starSize} />
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          transform: `translateY(${vertical ? -20 * u : -40 * u}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10 * u,
        }}
      >
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: titleSize, lineHeight: 0.92, letterSpacing: "-0.04em", color: C.paper, textAlign: "center" }}>
          <KineticWords text="Tu arte," start={30} />
          <br />
          <KineticWords text="visto." start={40} wordStyle={{ color: C.lavender }} />
        </div>
        <div
          style={{
            marginTop: 26 * u,
            fontFamily: FONT.body,
            fontSize: 34 * u,
            color: C.mist,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            opacity: interpolate(frame, [52, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            display: "flex",
            alignItems: "center",
            gap: 14 * u,
          }}
        >
          <span style={{ width: 14 * u, height: 14 * u, borderRadius: 999, backgroundColor: C.spark, display: "inline-block" }} />
          La red social para artistas
        </div>
      </div>
    </AbsoluteFill>
  )
}
