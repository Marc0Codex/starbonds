import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { StarGlyph } from "../components/Brand"
import { KineticWords } from "../components/KineticWords"
import { PleiAnimated } from "../components/PleiAnimated"
import { useLayout } from "../layout"
import { C, FONT } from "../theme"
import { EASE_OUT } from "../timing"

// 11.5–15 s: logo, "Tu talento, conectado.", CTA and URL, with Plei cheering.
export function Outro() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { vertical, u } = useLayout()

  const logo = spring({ frame, fps, config: { damping: 14, stiffness: 120 } })
  const cta = spring({ frame: frame - 44, fps, config: { damping: 10, stiffness: 160 } })
  const url = interpolate(frame, [54, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })
  const pleiIn = spring({ frame: frame - 26, fps, config: { damping: 12, stiffness: 120 } })
  const pulse = 1 + Math.max(0, Math.sin((frame - 60) / 5)) * 0.04 * (frame > 60 ? 1 : 0)
  const bigStar = interpolate(frame, [0, 110], [0, 90])
  const titleSize = (vertical ? 112 : 140) * u
  const pleiSize = (vertical ? 300 : 260) * u

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", opacity: 0.55, transform: `rotate(${bigStar}deg) scale(${0.6 + logo * 0.4})` }}>
        <StarGlyph size={(vertical ? 1500 : 1300) * u} color={C.plum} />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40 * u,
          textAlign: "center",
          transform: `translateY(${vertical ? -80 * u : -30 * u}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 * u, transform: `scale(${logo})` }}>
          <div style={{ transform: `rotate(${frame * 2}deg)` }}>
            <StarGlyph size={84 * u} />
          </div>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 76 * u, letterSpacing: "-0.03em", color: C.paper }}>
            STARBONDS
          </span>
        </div>

        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: titleSize, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.paper }}>
          <KineticWords text="Tu talento," start={14} />
          <br />
          <KineticWords
            text="conectado."
            start={24}
            wordStyle={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em", color: C.lavender }}
          />
        </div>

        <div
          style={{
            backgroundColor: C.spark,
            color: C.sparkInk,
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 44 * u,
            padding: `${24 * u}px ${56 * u}px`,
            borderRadius: 999,
            transform: `scale(${cta * pulse})`,
          }}
        >
          Únete gratis
        </div>

        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 40 * u,
            color: C.mist,
            letterSpacing: "0.02em",
            opacity: url,
            transform: `translateY(${(1 - url) * 20 * u}px)`,
          }}
        >
          starbonds.vercel.app
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: (vertical ? 70 : 170) * u,
          bottom: (vertical ? 170 : 90) * u,
          transform: `translateY(${(1 - pleiIn) * 500 * u}px)`,
        }}
      >
        <PleiAnimated
          size={pleiSize}
          mood={frame < 60 ? "happy" : "celebrate"}
          look={{ x: -2.5, y: -1.5 }}
          reactions={[
            { at: 40, kind: "hop" },
            { at: 62, kind: "spin" },
            { at: 88, kind: "bounce" },
          ]}
          sparksAt={64}
        />
      </div>
    </AbsoluteFill>
  )
}
