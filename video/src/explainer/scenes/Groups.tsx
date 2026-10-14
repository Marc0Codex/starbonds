import { useCurrentFrame } from "remotion"

import { GenerativeArt } from "../../components/GenerativeArt"
import { Stage } from "../../components/Stage"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { Avatar, Caption, Icon, Sfx, TapRing, useProgress } from "../ui"

const GROUPS = [
  { name: "Acuarela CR", topic: "Técnica · San José", members: 214, palette: 1 },
  { name: "Fanzines y collage", topic: "Proyecto colectivo", members: 89, palette: 2 },
  { name: "Muralistas", topic: "Arte urbano", members: 132, palette: 0 },
]
const JOIN_AT = 36

function GroupCard({ index }: { index: number }) {
  const frame = useCurrentFrame()
  const g = GROUPS[index]
  const enter = useProgress(4 + index * 6, 22 + index * 6)
  const joinable = index === 0
  const joined = joinable && frame >= JOIN_AT + 3
  const pressed = joinable && frame >= JOIN_AT && frame < JOIN_AT + 5
  const newcomer = useProgress(JOIN_AT + 3, JOIN_AT + 14)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 16,
        borderRadius: 26,
        backgroundColor: C.card,
        border: `1px solid ${joined ? C.grape : C.line}`,
        opacity: enter,
        transform: `translateX(${(1 - enter) * 220}px) rotate(${(1 - enter) * 4}deg)`,
      }}
    >
      <div style={{ position: "relative", width: 76, height: 76, borderRadius: 20, overflow: "hidden", flexShrink: 0 }}>
        <GenerativeArt palette={g.palette} square={g.palette === 2} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em" }}>{g.name}</div>
        <div style={{ color: C.mist, fontSize: 14 }}>{g.topic}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <div style={{ display: "flex" }}>
            {["#5b2a86", "#3b1f6b", "#bfa8ff"].map((c, i) => (
              <div key={c} style={{ marginLeft: i ? -10 : 0, border: `2px solid ${C.card}`, borderRadius: 999 }}>
                <Avatar initials="" color={c} size={24} />
              </div>
            ))}
            {joined && (
              <div style={{ marginLeft: -10, border: `2px solid ${C.card}`, borderRadius: 999, transform: `scale(${newcomer})` }}>
                <Avatar initials="LR" color={C.spark} size={24} />
              </div>
            )}
          </div>
          <span style={{ color: C.mist, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{g.members + (joined ? 1 : 0)} miembros</span>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 15,
            fontWeight: 600,
            padding: "10px 16px",
            borderRadius: 999,
            backgroundColor: joined ? C.plum : joinable ? C.lavender : C.raise,
            color: joined ? C.paper : joinable ? C.sparkInk : C.paper,
            border: `1px solid ${joined ? C.grape : joinable ? C.lavender : C.line}`,
            transform: `scale(${pressed ? 0.92 : 1})`,
          }}
        >
          {joined && <Icon name="check" size={16} color={C.spark} strokeWidth={3} />}
          {joined ? "Miembro" : "Unirme"}
        </div>
        {joinable && <TapRing at={JOIN_AT} />}
      </div>
    </div>
  )
}

// Groups: three group cards slide in and you join the first one.
export function Groups() {
  const { vertical, u } = useLayout()
  const s = (vertical ? 1.62 : 1.3) * u

  const device = (
    <div style={{ width: 520 * s, height: 420 * s, position: "relative" }}>
      <div
        style={{
          width: 520,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          fontFamily: FONT.body,
          color: C.paper,
        }}
      >
        {GROUPS.map((g, i) => (
          <GroupCard key={g.name} index={i} />
        ))}
      </div>
    </div>
  )

  return (
    <>
      <Sfx at={4} name="swipe" volume={0.3} />
      <Sfx at={JOIN_AT} name="tap" volume={0.6} />
      <Sfx at={JOIN_AT + 3} name="pop" volume={0.5} />
      <Stage
        caption={<Caption eyebrow="Grupos" lead="Encuentra" accent="tu gente." body="Espacios por técnica, ciudad o proyecto para crear en colectivo." />}
        device={device}
      />
    </>
  )
}
