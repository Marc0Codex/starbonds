import { interpolate, useCurrentFrame } from "remotion"

import { PhoneFrame } from "../../components/PhoneFrame"
import { Stage } from "../../components/Stage"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { EASE_SWIPE } from "../../timing"
import { Avatar, Caption, ScreenTitle, Sfx, TapRing, usePop } from "../ui"

const OPEN_AT = 24
const MINE_AT = 50
const REPLY_AT = 68

const INBOX = [
  { initials: "LR", color: C.grape, name: "Luna Ríos", last: "¿Hacemos un mural juntos?", unread: 2 },
  { initials: "MC", color: C.plum, name: "Mateo Cruz", last: "¡Gracias por la foto!", unread: 0 },
  { initials: "AT", color: "#2d2240", name: "Aiko Tanaka", last: "Tú: Te mando el fanzine", unread: 0 },
]

function Bubble({ mine, text, at }: { mine: boolean; text: string; at?: number }) {
  const frame = useCurrentFrame()
  const p = usePop(at ?? -100, 12, 170)
  if (at !== undefined && frame < at) return null
  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "80%",
        padding: "12px 16px",
        borderRadius: 22,
        borderBottomRightRadius: mine ? 6 : 22,
        borderBottomLeftRadius: mine ? 22 : 6,
        backgroundColor: mine ? C.lavender : C.raise,
        color: mine ? C.sparkInk : C.paper,
        border: mine ? "none" : `1px solid ${C.line}`,
        fontSize: 17,
        lineHeight: 1.4,
        transform: `scale(${p}) translateY(${(1 - p) * 20}px)`,
        transformOrigin: mine ? "right bottom" : "left bottom",
      }}
    >
      {text}
    </div>
  )
}

// Messages: the inbox shows an unread chat; opening it slides the conversation in and replies arrive live.
export function Messages() {
  const frame = useCurrentFrame()
  const { vertical, u } = useLayout()

  const open = interpolate(frame, [OPEN_AT + 2, OPEN_AT + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_SWIPE })
  const badge = usePop(6, 9, 200)
  const pressed = frame >= OPEN_AT && frame < OPEN_AT + 6

  const phone = (
    <PhoneFrame height={(vertical ? 1060 : 860) * u}>
      <div style={{ position: "absolute", inset: 0, fontFamily: FONT.body, color: C.paper, overflow: "hidden" }}>
        {/* inbox */}
        <div style={{ position: "absolute", inset: 0, padding: "30px 22px 0", transform: `translateX(${-open * 120}px)`, opacity: 1 - open * 0.6 }}>
          <ScreenTitle title="Mensajes" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 20 }}>
            {INBOX.map((c, i) => (
              <div
                key={c.name}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 14,
                  borderRadius: 20,
                  backgroundColor: i === 0 ? (pressed ? C.raise : C.card) : "transparent",
                  border: `1px solid ${i === 0 ? C.line : "transparent"}`,
                }}
              >
                <Avatar initials={c.initials} color={c.color} size={50} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</div>
                  <div style={{ fontSize: 14, color: c.unread ? C.paper : C.mist, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.last}</div>
                </div>
                {c.unread > 0 && (
                  <span
                    style={{
                      minWidth: 26,
                      height: 26,
                      borderRadius: 999,
                      backgroundColor: C.spark,
                      color: C.sparkInk,
                      fontWeight: 700,
                      fontSize: 14,
                      display: "grid",
                      placeItems: "center",
                      transform: `scale(${badge})`,
                    }}
                  >
                    {c.unread}
                  </span>
                )}
                {i === 0 && <TapRing at={OPEN_AT} radius={24} inset={-4} />}
              </div>
            ))}
          </div>
        </div>

        {/* conversation */}
        {open > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: C.ink,
              transform: `translateX(${(1 - open) * 100}%)`,
              display: "flex",
              flexDirection: "column",
              borderLeft: `1px solid ${C.line}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "26px 20px 16px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 22, color: C.mist }}>‹</span>
              <Avatar initials="LR" color={C.grape} size={42} />
              <div>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18 }}>Luna Ríos</div>
                <div style={{ fontSize: 13, color: C.mist }}>
                  <span style={{ fontFamily: FONT.serif, fontStyle: "italic", color: C.lavender }}>Match</span> · Pintura
                </div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10, padding: "0 18px 18px" }}>
              <Bubble mine={false} text="¡Hola! Vi tu portafolio." />
              <Bubble mine={false} text="¿Hacemos un mural juntos?" />
              <Bubble mine text="¡Sí! Te mando bocetos hoy." at={MINE_AT} />
              <Bubble mine={false} text="¡Trato hecho!" at={REPLY_AT} />
            </div>
            <div style={{ margin: "0 18px 26px", padding: "14px 18px", borderRadius: 999, backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.mist, fontSize: 15 }}>
              Escribe un mensaje…
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  )

  return (
    <>
      <Sfx at={6} name="pop" volume={0.4} />
      <Sfx at={OPEN_AT} name="tap" volume={0.6} />
      <Sfx at={OPEN_AT + 2} name="swipe" volume={0.3} />
      <Sfx at={MINE_AT} name="message" volume={0.45} />
      <Sfx at={REPLY_AT} name="message" volume={0.55} />
      <Stage
        caption={<Caption eyebrow="Mensajes" lead="Habla" accent="en tiempo real." body="Chats privados con tus matches y con quien te quiera comprar." />}
        device={phone}
      />
    </>
  )
}
