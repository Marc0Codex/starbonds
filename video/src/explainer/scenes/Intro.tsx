import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { StarGlyph } from "../../components/Brand"
import { KineticWords } from "../../components/KineticWords"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { EASE_OUT } from "../../timing"
import { INTRO_PLEI_AT } from "../plei-path"
import { Sfx } from "../ui"

// 0–3.3 s: the brand star spins in and bursts; Plei (global layer) appears in its place and says hi.
export function Intro() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { vertical, u, width, height } = useLayout()

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 120 } })
  const shrink = interpolate(frame, [INTRO_PLEI_AT - 6, INTRO_PLEI_AT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const burst = interpolate(frame, [INTRO_PLEI_AT - 2, INTRO_PLEI_AT + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const sub = interpolate(frame, [52, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })

  const cx = width / 2
  const cy = height * (vertical ? 0.36 : 0.33)
  const starSize = 260 * u

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sfx at={0} name="rise" volume={0.5} />
      <Sfx at={34} name="pop" volume={0.35} />

      {burst > 0 &&
        burst < 1 &&
        Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2 + 0.2
          const dist = burst * Math.min(width, height) * 0.5
          const s = 36 * u * (1 - burst * 0.6)
          return (
            <div key={i} style={{ position: "absolute", left: cx + Math.cos(angle) * dist - s / 2, top: cy + Math.sin(angle) * dist - s / 2, opacity: 1 - burst }}>
              <StarGlyph size={s} color={i % 3 === 0 ? C.spark : C.lavender} />
            </div>
          )
        })}

      {shrink > 0 && (
        <div
          style={{
            position: "absolute",
            left: cx - starSize / 2,
            top: cy - starSize / 2,
            transform: `rotate(${(1 - enter) * -540 + frame * 3}deg) scale(${enter * shrink})`,
          }}
        >
          <StarGlyph size={starSize} />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * (vertical ? 0.53 : 0.58),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30 * u,
          padding: `0 ${80 * u}px`,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: (vertical ? 140 : 130) * u, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.paper }}>
          <KineticWords text="¡Hola!" start={30} />{" "}
          <KineticWords text="Soy Plei." start={38} wordStyle={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, color: C.lavender, letterSpacing: "-0.01em" }} />
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 40 * u,
            lineHeight: 1.35,
            color: C.mist,
            maxWidth: 820 * u,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 20 * u}px)`,
          }}
        >
          Te muestro todo lo que puedes hacer en{" "}
          <span style={{ color: C.paper, fontFamily: FONT.display, fontWeight: 700 }}>STARBONDS</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
