import { interpolate, useCurrentFrame } from "remotion"

import { StarGlyph } from "../../components/Brand"
import { PhoneFrame } from "../../components/PhoneFrame"
import { Stage } from "../../components/Stage"
import { useLayout } from "../../layout"
import { Card } from "../../scenes/Match"
import { C, FONT } from "../../theme"
import { EASE_OUT, EASE_SWIPE } from "../../timing"
import { Caption, Sfx, usePop } from "../ui"

export const PASS_AT = 24
export const LIKE_AT = 66
export const MATCH_AT = 82

const DECK = [
  { name: "Mateo Cruz", handle: "@mateo · San José", palette: 2, badge: "1 tag en común", tags: [["Fotografía", false], ["Música", false], ["Colaborar", true]] },
  { name: "Luna Ríos", handle: "@luna · CDMX", palette: 0, badge: "3 tags en común", tags: [["Pintura", true], ["Abstracto", true], ["Colaborar", true], ["Exponer", false]] },
  { name: "Sofía Mora", handle: "@sofi · Heredia", palette: 3, badge: "2 tags en común", tags: [["Acuarela", true], ["Ilustración", false], ["Colaborar", true]] },
] as { name: string; handle: string; palette: number; badge: string; tags: [string, boolean][] }[]

function Stamp({ label, color, side, opacity }: { label: string; color: string; side: "left" | "right"; opacity: number }) {
  return (
    <span
      style={{
        position: "absolute",
        [side]: 26,
        top: 110,
        transform: `rotate(${side === "left" ? -12 : 12}deg)`,
        border: `4px solid ${color}`,
        color,
        borderRadius: 14,
        padding: "4px 16px",
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: 34,
        textTransform: "uppercase",
        opacity,
      }}
    >
      {label}
    </span>
  )
}

// Match: pass on one artist, connect with the next, "Es un match."
export function Match() {
  const frame = useCurrentFrame()
  const { vertical, u } = useLayout()

  const swipeX = (dragFrom: number, flyAt: number, dir: 1 | -1) => {
    const drag = interpolate(frame, [dragFrom, flyAt], [0, 95], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })
    const fly = interpolate(frame, [flyAt, flyAt + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_SWIPE })
    return { x: dir * (drag + fly * 460), gone: fly >= 1 }
  }
  const first = swipeX(PASS_AT - 14, PASS_AT, -1)
  const second = swipeX(LIKE_AT - 16, LIKE_AT, 1)

  const front = first.gone ? (second.gone ? 2 : 1) : 0
  const frontX = front === 0 ? first.x : front === 1 ? second.x : 0
  const promoteAt = front === 0 ? -100 : front === 1 ? PASS_AT + 4 : LIKE_AT + 4
  const backScale = interpolate(frame, [promoteAt, promoteAt + 16], [0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })

  const overlay = usePop(MATCH_AT, 13, 120)
  const passBtn = frame >= PASS_AT - 6 && frame < PASS_AT + 4
  const likeBtn = frame >= LIKE_AT - 6 && frame < LIKE_AT + 6

  const phone = (
    <PhoneFrame height={(vertical ? 1060 : 860) * u}>
      <div style={{ padding: "28px 22px 0", fontFamily: FONT.body, color: C.paper, height: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 32, letterSpacing: "-0.03em" }}>Match</div>
        <div style={{ color: C.mist, fontSize: 15, marginTop: 4 }}>
          Artistas afines a tus{" "}
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic", color: C.lavender, fontSize: 17 }}>técnicas y objetivos</span>
        </div>

        <div style={{ position: "relative", height: 560, marginTop: 22 }}>
          {front + 1 < DECK.length && (
            <div style={{ position: "absolute", inset: 0, transform: "scale(0.94) translateY(16px)" }}>
              <Card {...DECK[front + 1]} />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateX(${frontX}px) rotate(${frontX / 18}deg) scale(${backScale}) translateY(${(1 - backScale) * 260}px)`,
            }}
          >
            <Card {...DECK[front]} />
            {front === 0 && <Stamp label="Paso" color={C.mist} side="right" opacity={Math.min(1, -frontX / 90)} />}
            {front === 1 && <Stamp label="Conectar" color={C.spark} side="left" opacity={Math.min(1, frontX / 90)} />}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 26, marginTop: 26 }}>
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 999,
              border: `1px solid ${passBtn ? C.paper : C.line}`,
              backgroundColor: passBtn ? C.raise : C.card,
              display: "grid",
              placeItems: "center",
              fontSize: 26,
              color: C.paper,
              transform: `scale(${passBtn ? 0.9 : 1})`,
            }}
          >
            ✕
          </div>
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: 999,
              backgroundColor: likeBtn ? C.spark : C.lavender,
              display: "grid",
              placeItems: "center",
              transform: `scale(${likeBtn ? 0.9 : 1})`,
            }}
          >
            <StarGlyph size={34} color={C.sparkInk} />
          </div>
        </div>
      </div>

      {overlay > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: C.plum,
            opacity: Math.min(1, overlay * 1.4),
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
            padding: 34,
            fontFamily: FONT.body,
            color: C.paper,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", right: -90, top: -90, transform: `rotate(${frame * 1.5}deg)` }}>
            <StarGlyph size={320} color={C.grape} />
          </div>
          <div style={{ transform: `scale(${overlay}) rotate(${(1 - overlay) * -120}deg)`, transformOrigin: "left center" }}>
            <StarGlyph size={96} color={C.spark} />
          </div>
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 60, lineHeight: 0.95, letterSpacing: "-0.04em", transform: `translateY(${(1 - overlay) * 40}px)` }}>
            Es un <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, color: C.spark }}>match.</span>
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.5, opacity: interpolate(frame, [MATCH_AT + 10, MATCH_AT + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            Tú y Luna quieren crear juntos.
          </div>
          <div
            style={{
              backgroundColor: C.spark,
              color: C.sparkInk,
              fontWeight: 600,
              fontSize: 18,
              textAlign: "center",
              padding: "16px 0",
              borderRadius: 999,
              opacity: interpolate(frame, [MATCH_AT + 18, MATCH_AT + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            Enviar mensaje
          </div>
        </div>
      )}
    </PhoneFrame>
  )

  return (
    <>
      <Sfx at={PASS_AT} name="swipe" volume={0.5} />
      <Sfx at={LIKE_AT - 6} name="tap" volume={0.5} />
      <Sfx at={LIKE_AT} name="swipe" volume={0.55} />
      <Sfx at={MATCH_AT} name="chime" volume={0.6} />
      <Stage
        caption={
          <Caption eyebrow="Match con Plei" lead="Desliza." accent="Crea en equipo." body="Plei te presenta artistas con tus mismas técnicas y objetivos." />
        }
        device={phone}
      />
    </>
  )
}
