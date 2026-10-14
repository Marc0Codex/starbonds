import { interpolate, useCurrentFrame } from "remotion"

import { GenerativeArt } from "../../components/GenerativeArt"
import { PhoneFrame } from "../../components/PhoneFrame"
import { Stage } from "../../components/Stage"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { EASE_OUT, EASE_SWIPE } from "../../timing"
import { Avatar, Caption, Chip, Icon, ScreenTitle, Sfx, TapRing, usePop } from "../ui"

type Kind = "Obra" | "Servicio"
const LISTINGS: { title: string; by: string; price: number; kind: Kind; palette: number; from?: boolean }[] = [
  { title: "Órbita lenta", by: "Luna Ríos", price: 180, kind: "Obra", palette: 0 },
  { title: "Retrato por encargo", by: "Aiko Tanaka", price: 60, kind: "Servicio", palette: 1, from: true },
  { title: "Clases de acuarela", by: "Sofía Mora", price: 25, kind: "Servicio", palette: 3, from: true },
  { title: "Marea", by: "Mateo Cruz", price: 95, kind: "Obra", palette: 2 },
]
const FILTERS = ["Todo", "Obras", "Servicios"] as const
const OBRAS_AT = 30
const SERVICIOS_AT = 50
const SHEET_AT = 66
const CONTACT_AT = 86

// Eased 0→1 "filtered out" amount for a listing kind.
function dimAmount(kind: Kind, frame: number) {
  const ramp = (at: number) => interpolate(frame, [at, at + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return kind === "Obra" ? ramp(SERVICIOS_AT) : ramp(OBRAS_AT) - ramp(SERVICIOS_AT)
}

function ListingCard({ index }: { index: number }) {
  const frame = useCurrentFrame()
  const l = LISTINGS[index]
  const enter = usePop(4 + index * 4, 13, 150)
  const price = Math.round(interpolate(frame, [6 + index * 4, 28 + index * 4], [0, l.price], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT }))
  const dim = dimAmount(l.kind, frame)
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: C.card,
        border: `1px solid ${C.line}`,
        opacity: 1 - dim * 0.78,
        transform: `scale(${enter * (1 - dim * 0.05)})`,
      }}
    >
      <div style={{ position: "relative", height: 132 }}>
        <GenerativeArt palette={l.palette} square={l.palette === 2} />
        <span style={{ position: "absolute", left: 10, top: 10, backgroundColor: C.ink, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>{l.kind}</span>
      </div>
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: C.lavender, fontVariantNumeric: "tabular-nums" }}>
          {l.from && <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 13, color: C.mist }}>desde </span>}${price}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
        <div style={{ fontSize: 13, color: C.mist }}>
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic" }}>por</span> {l.by}
        </div>
      </div>
    </div>
  )
}

// Market: prices tick in, filters switch between artworks and services, then you contact the seller.
export function Market() {
  const frame = useCurrentFrame()
  const { vertical, u } = useLayout()

  const filter = frame >= SERVICIOS_AT ? 2 : frame >= OBRAS_AT ? 1 : 0
  const sheet = interpolate(frame, [SHEET_AT, SHEET_AT + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_SWIPE })
  const contacted = frame >= CONTACT_AT + 3
  const chip = usePop(CONTACT_AT + 4, 10, 180)

  const phone = (
    <PhoneFrame height={(vertical ? 1060 : 860) * u}>
      <div style={{ position: "absolute", inset: 0, padding: "30px 20px 0", fontFamily: FONT.body, color: C.paper }}>
        <ScreenTitle title="Mercado" />
        <div style={{ color: C.mist, fontSize: 15, marginTop: 4 }}>
          Obras y servicios directo de <span style={{ fontFamily: FONT.serif, fontStyle: "italic", color: C.lavender, fontSize: 17 }}>quien los crea</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          {FILTERS.map((f, i) => (
            <div key={f} style={{ position: "relative" }}>
              <Chip active={filter === i}>{f}</Chip>
              {i === 1 && <TapRing at={OBRAS_AT} />}
              {i === 2 && <TapRing at={SERVICIOS_AT} />}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
          {LISTINGS.map((l, i) => (
            <ListingCard key={l.title} index={i} />
          ))}
        </div>
      </div>

      {/* listing detail sheet */}
      {sheet > 0 && (
        <>
          <div style={{ position: "absolute", inset: 0, backgroundColor: C.ink, opacity: sheet * 0.6 }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "16px 22px 34px",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              backgroundColor: C.card,
              borderTop: `1px solid ${C.line}`,
              fontFamily: FONT.body,
              color: C.paper,
              transform: `translateY(${(1 - sheet) * 100}%)`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 999, backgroundColor: C.line }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar initials="AT" color={C.plum} size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 21 }}>Retrato por encargo</div>
                <div style={{ fontSize: 14, color: C.mist }}>Servicio · Aiko Tanaka</div>
              </div>
              <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: C.lavender }}>$60</div>
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.45, color: C.mist }}>Retrato digital a partir de tu foto. Entrega en 5 días, dos rondas de cambios.</div>
            <div style={{ position: "relative", marginTop: 6 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  backgroundColor: contacted || (frame >= CONTACT_AT && frame < CONTACT_AT + 6) ? C.spark : C.lavender,
                  color: C.sparkInk,
                  fontWeight: 600,
                  fontSize: 17,
                  padding: "15px 0",
                  borderRadius: 999,
                  transform: `scale(${frame >= CONTACT_AT && frame < CONTACT_AT + 5 ? 0.95 : 1})`,
                }}
              >
                <Icon name={contacted ? "check" : "message"} size={20} color={C.sparkInk} strokeWidth={2.2} />
                {contacted ? "Chat abierto" : "Contactar al artista"}
              </div>
              <TapRing at={CONTACT_AT} />
            </div>
            {contacted && (
              <div style={{ alignSelf: "center", transform: `scale(${chip})` }}>
                <Chip style={{ backgroundColor: C.plum, borderColor: C.grape }}>
                  <span style={{ fontFamily: FONT.serif, fontStyle: "italic", color: C.lavender }}>Sobre</span> Retrato por encargo
                </Chip>
              </div>
            )}
          </div>
        </>
      )}
    </PhoneFrame>
  )

  return (
    <>
      {[8, 12, 16, 20].map((at) => (
        <Sfx key={at} at={at} name="tick" volume={0.3} />
      ))}
      <Sfx at={OBRAS_AT} name="tap" volume={0.55} />
      <Sfx at={SERVICIOS_AT} name="tap" volume={0.55} />
      <Sfx at={SHEET_AT} name="swipe" volume={0.35} />
      <Sfx at={CONTACT_AT} name="tap" volume={0.6} />
      <Sfx at={CONTACT_AT + 4} name="message" volume={0.5} />
      <Stage
        caption={<Caption eyebrow="Mercado" lead="Vende obras" accent="y servicios." body="Publica piezas o encargos y conversa directo con quien compra." />}
        device={phone}
      />
    </>
  )
}
