import { interpolate, useCurrentFrame } from "remotion"

import { GenerativeArt } from "../../components/GenerativeArt"
import { PhoneFrame } from "../../components/PhoneFrame"
import { Stage } from "../../components/Stage"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { Avatar, Caption, Chip, Icon, Sfx, TapRing, usePop } from "../ui"

const TAGS = ["Pintura", "Abstracto", "Acuarela", "Colaborar"]
const TAG_AT = 14
const TILE_AT = 36
const ADD_AT = 72

function Tile({ index, palette }: { index: number; palette: number }) {
  const p = usePop(TILE_AT + index * 4, 12, 180)
  return (
    <div style={{ position: "relative", aspectRatio: "1", borderRadius: 14, overflow: "hidden", transform: `scale(${p})` }}>
      <GenerativeArt palette={palette} square={palette === 2} />
    </div>
  )
}

// Profile: tags pop in, the portfolio fills, "+" adds a new artwork, followers tick up.
export function Profile() {
  const frame = useCurrentFrame()
  const { vertical, u } = useLayout()

  const newArt = usePop(ADD_AT + 4, 10, 200)
  const followers = Math.round(interpolate(frame, [62, 90], [120, 128], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
  const collab = usePop(8)
  const addTile = usePop(TILE_AT + 20)

  const phone = (
    <PhoneFrame height={(vertical ? 1060 : 860) * u}>
      <div style={{ padding: "34px 22px 0", fontFamily: FONT.body, color: C.paper }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar initials="LR" color={C.grape} size={86} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em" }}>Luna Ríos</div>
            <div style={{ color: C.mist, fontSize: 14 }}>@luna · CDMX</div>
            <div style={{ fontSize: 14, color: C.mist, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: C.paper, fontWeight: 600 }}>{followers}</span> seguidores · <span style={{ color: C.paper, fontWeight: 600 }}>86</span> siguiendo
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, transform: `scale(${collab})`, transformOrigin: "left center", display: "inline-flex" }}>
          <Chip style={{ backgroundColor: C.plum, borderColor: C.grape }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: C.spark }} />
            Abierto a colaborar
          </Chip>
        </div>

        <div style={{ marginTop: 16, fontSize: 15, lineHeight: 1.45, color: C.paper }}>
          Pinto órbitas, lunas y silencios. Busco colaborar en murales.
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
          {TAGS.map((tag, i) => (
            <TagPop key={tag} at={TAG_AT + i * 5} label={tag} accent={tag === "Colaborar"} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 28, paddingBottom: 12, borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18 }}>Portafolio</span>
          <span style={{ color: C.mist, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{frame >= ADD_AT + 4 ? 6 : 5} obras</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
          {[0, 1, 3, 2, 1].map((palette, i) => (
            <Tile key={i} index={i} palette={palette} />
          ))}
          <div style={{ position: "relative", aspectRatio: "1" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 14,
                border: `2px dashed ${C.grape}`,
                display: "grid",
                placeItems: "center",
                transform: `scale(${addTile * (frame >= ADD_AT && frame < ADD_AT + 5 ? 0.92 : 1)})`,
              }}
            >
              <Icon name="plus" size={32} color={C.lavender} strokeWidth={2.2} />
            </div>
            {frame >= ADD_AT + 4 && (
              <div style={{ position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden", transform: `scale(${newArt})` }}>
                <GenerativeArt palette={2} square />
              </div>
            )}
            <TapRing at={ADD_AT} radius={18} />
          </div>
        </div>
      </div>
    </PhoneFrame>
  )

  return (
    <>
      {TAGS.map((tag, i) => (
        <Sfx key={tag} at={TAG_AT + i * 5} name="tick" volume={0.45} />
      ))}
      <Sfx at={TILE_AT} name="pop" volume={0.4} />
      <Sfx at={TILE_AT + 8} name="pop" volume={0.35} />
      <Sfx at={TILE_AT + 16} name="pop" volume={0.3} />
      <Sfx at={ADD_AT} name="tap" volume={0.6} />
      <Sfx at={ADD_AT + 4} name="pop" volume={0.55} />
      <Stage
        caption={
          <Caption
            eyebrow="Perfil y portafolio"
            lead="Muestra"
            accent="tu universo."
            body="Elige tus técnicas y objetivos, y sube tus obras para que te descubran."
          />
        }
        device={phone}
      />
    </>
  )
}

function TagPop({ at, label, accent }: { at: number; label: string; accent: boolean }) {
  const p = usePop(at, 10, 200)
  return (
    <div style={{ transform: `scale(${p})` }}>
      <Chip style={accent ? { backgroundColor: C.plum, borderColor: C.grape } : undefined}>
        {accent && <span style={{ color: C.spark, fontWeight: 700 }}>✓</span>}
        {label}
      </Chip>
    </div>
  )
}
