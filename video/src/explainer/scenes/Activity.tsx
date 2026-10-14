import { interpolate, useCurrentFrame } from "remotion"

import { StarGlyph } from "../../components/Brand"
import { PhoneFrame } from "../../components/PhoneFrame"
import { Stage } from "../../components/Stage"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { EASE_OUT } from "../../timing"
import { Avatar, Caption, Icon, ScreenTitle, Sfx, usePop } from "../ui"

type Kind = "like" | "follow" | "match" | "group"
const ITEMS: { at: number; initials: string; color: string; name: string; text: string; kind: Kind }[] = [
  { at: 8, initials: "AT", color: C.plum, name: "Aiko", text: "le gustó tu publicación", kind: "like" },
  { at: 20, initials: "MC", color: "#2d2240", name: "Mateo", text: "empezó a seguirte", kind: "follow" },
  { at: 32, initials: "LR", color: C.grape, name: "Luna", text: "hizo match contigo", kind: "match" },
  { at: 44, initials: "SM", color: C.plum, name: "Sofía", text: "se unió a Acuarela CR", kind: "group" },
]
const ROW_H = 92

function KindIcon({ kind }: { kind: Kind }) {
  if (kind === "match") return <StarGlyph size={16} color={C.sparkInk} />
  const name = kind === "like" ? "heart" : kind === "follow" ? "userPlus" : "users"
  return <Icon name={name} size={15} color={C.sparkInk} fill={kind === "like" ? C.sparkInk : "none"} strokeWidth={2.4} />
}

// Activity: notifications drop in one by one, newest on top, and the bell counter climbs.
export function Activity() {
  const frame = useCurrentFrame()
  const { vertical, u } = useLayout()

  const progress = ITEMS.map((it) => interpolate(frame, [it.at, it.at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT }))
  const count = ITEMS.filter((it) => frame >= it.at).length
  const lastAt = [...ITEMS].reverse().find((it) => frame >= it.at)?.at ?? -100
  const ring = usePop(lastAt, 6, 260)
  const swing = frame >= lastAt && frame < lastAt + 16 ? Math.sin((frame - lastAt) * 1.4) * 14 * (1 - (frame - lastAt) / 16) : 0

  const phone = (
    <PhoneFrame height={(vertical ? 1060 : 860) * u}>
      <div style={{ padding: "30px 22px 0", fontFamily: FONT.body, color: C.paper }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ScreenTitle title="Actividad" />
          <div style={{ position: "relative", transform: `rotate(${swing}deg)`, transformOrigin: "50% 10%" }}>
            <Icon name="bell" size={30} />
            {count > 0 && (
              <span
                style={{
                  position: "absolute",
                  right: -10,
                  top: -8,
                  minWidth: 22,
                  height: 22,
                  borderRadius: 999,
                  backgroundColor: C.spark,
                  color: C.sparkInk,
                  fontWeight: 700,
                  fontSize: 13,
                  display: "grid",
                  placeItems: "center",
                  transform: `scale(${0.7 + ring * 0.3})`,
                }}
              >
                {count}
              </span>
            )}
          </div>
        </div>

        <div style={{ position: "relative", marginTop: 24, height: ROW_H * ITEMS.length }}>
          {ITEMS.map((it, k) => {
            const pushed = progress.slice(k + 1).reduce((sum, p) => sum + p, 0)
            const p = progress[k]
            if (p <= 0) return null
            return (
              <div
                key={it.name}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: pushed * ROW_H,
                  height: ROW_H - 10,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 14px",
                  borderRadius: 20,
                  backgroundColor: C.card,
                  border: `1px solid ${k === count - 1 ? C.grape : C.line}`,
                  opacity: p,
                  transform: `translateY(${(1 - p) * -40}px) scale(${0.94 + p * 0.06})`,
                }}
              >
                <div style={{ position: "relative" }}>
                  <Avatar initials={it.initials} color={it.color} size={48} />
                  <span
                    style={{
                      position: "absolute",
                      right: -4,
                      bottom: -4,
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      backgroundColor: it.kind === "match" ? C.spark : C.lavender,
                      border: `2px solid ${C.card}`,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <KindIcon kind={it.kind} />
                  </span>
                </div>
                <div style={{ flex: 1, fontSize: 15, lineHeight: 1.35 }}>
                  <span style={{ fontWeight: 600 }}>{it.name}</span> {it.text}
                  <div style={{ fontSize: 13, color: C.mist }}>ahora</div>
                </div>
                <span style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: C.spark }} />
              </div>
            )
          })}
        </div>
      </div>
    </PhoneFrame>
  )

  return (
    <>
      <Sfx at={ITEMS[0].at} name="notify" volume={0.45} />
      {ITEMS.slice(1).map((it) => (
        <Sfx key={it.at} at={it.at} name="pop" volume={0.4} />
      ))}
      <Stage
        caption={<Caption eyebrow="Actividad" lead="No te pierdas" accent="nada." body="Me gusta, comentarios, seguidores, matches y grupos en un solo lugar." />}
        device={phone}
      />
    </>
  )
}
