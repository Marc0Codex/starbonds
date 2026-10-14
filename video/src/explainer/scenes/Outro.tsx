import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion"

import { StarGlyph } from "../../components/Brand"
import { KineticWords } from "../../components/KineticWords"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { EASE_SWIPE } from "../../timing"
import { Chip, Sfx, usePop, useProgress } from "../ui"

const FEATURES = ["Perfil", "Comunidad", "Grupos", "Match", "Mensajes", "Mercado", "Actividad"]
const LOGO_AT = 26
const CTA_AT = 70

// Outro: every feature chip converges into the star, the logo lands, then the call to action.
export function Outro() {
  const frame = useCurrentFrame()
  const { vertical, u, width, height } = useLayout()

  const converge = useProgress(2, LOGO_AT, EASE_SWIPE)
  const logo = usePop(LOGO_AT, 12, 140)
  const cta = usePop(CTA_AT, 10, 160)
  const url = useProgress(CTA_AT + 10, CTA_AT + 26)
  const pulse = frame > CTA_AT + 20 ? 1 + Math.max(0, Math.sin((frame - CTA_AT - 20) / 5)) * 0.035 : 1
  const titleSize = (vertical ? 116 : 130) * u
  const cy = height * (vertical ? 0.4 : 0.44)

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sfx at={2} name="whoosh" volume={0.3} />
      <Sfx at={LOGO_AT} name="hit" volume={0.6} />
      <Sfx at={CTA_AT} name="pop" volume={0.5} />

      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: cy,
          opacity: 0.5,
          transform: `translate(-50%, -50%) rotate(${frame * 0.6}deg) scale(${0.5 + logo * 0.5})`,
        }}
      >
        <StarGlyph size={(vertical ? 1500 : 1250) * u} color={C.plum} />
      </div>

      {/* feature chips flying into the center */}
      {converge < 1 &&
        FEATURES.map((f, i) => {
          const angle = (i / FEATURES.length) * Math.PI * 2 - Math.PI / 2
          const r = (1 - converge) * Math.min(width, height) * 0.42
          const s = 2.8 * u * (1 - converge * 0.75)
          return (
            <div
              key={f}
              style={{
                position: "absolute",
                left: width / 2 + Math.cos(angle) * r * (vertical ? 1 : 1.6),
                top: cy + Math.sin(angle) * r * (vertical ? 1.5 : 1),
                transform: `translate(-50%, -50%) scale(${s}) rotate(${(1 - converge) * (i % 2 ? 8 : -8)}deg)`,
                opacity: 1 - converge * 0.6,
              }}
            >
              <Chip style={{ backgroundColor: i % 3 === 0 ? C.plum : C.raise, borderColor: C.grape }}>{f}</Chip>
            </div>
          )
        })}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cy,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40 * u,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 * u, transform: `scale(${logo})` }}>
          <div style={{ transform: `rotate(${frame * 2}deg)` }}>
            <StarGlyph size={84 * u} />
          </div>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 76 * u, letterSpacing: "-0.03em", color: C.paper }}>STARBONDS</span>
        </div>

        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: titleSize, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.paper }}>
          <KineticWords text="Tu arte," start={LOGO_AT + 12} />
          <br />
          <KineticWords
            text="por fin visto."
            start={LOGO_AT + 22}
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
    </AbsoluteFill>
  )
}

/** Exposed for the Plei layer so it can cheer exactly when the logo lands. */
export const OUTRO_LOGO_AT = LOGO_AT
export const OUTRO_CTA_AT = CTA_AT
