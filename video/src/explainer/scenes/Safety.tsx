import { useCurrentFrame } from "remotion"

import { Stage } from "../../components/Stage"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { Caption, Icon, ICONS, Sfx, TapRing, usePop } from "../ui"

const TILES: { icon: keyof typeof ICONS; title: string; body: string }[] = [
  { icon: "shield", title: "Bloquea", body: "Quien bloquees no puede escribirte ni reaccionar." },
  { icon: "flag", title: "Reporta", body: "Avísanos de cualquier abuso." },
  { icon: "phone", title: "Instálala", body: "Como app en tu celular, también sin conexión." },
  { icon: "globe", title: "Bilingüe", body: "Toda la app en español e inglés." },
]
const TILE_AT = 6
const LANG_AT = 46

function Tile({ index }: { index: number }) {
  const frame = useCurrentFrame()
  const t = TILES[index]
  const p = usePop(TILE_AT + index * 7, 11, 170)
  const isLang = t.icon === "globe"
  const english = isLang && frame >= LANG_AT + 2
  return (
    <div
      style={{
        position: "relative",
        padding: 22,
        borderRadius: 28,
        backgroundColor: C.card,
        border: `1px solid ${C.line}`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transform: `scale(${p}) rotate(${(1 - p) * (index % 2 ? 6 : -6)}deg)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: C.plum, display: "grid", placeItems: "center" }}>
          <Icon name={t.icon} size={28} color={C.lavender} strokeWidth={2} />
        </div>
        {isLang && (
          <div style={{ position: "relative", display: "flex", padding: 3, borderRadius: 999, backgroundColor: C.raise, border: `1px solid ${C.line}`, fontSize: 13, fontWeight: 700 }}>
            {["ES", "EN"].map((l, i) => (
              <span
                key={l}
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  backgroundColor: (i === 1) === english ? C.lavender : "transparent",
                  color: (i === 1) === english ? C.sparkInk : C.mist,
                }}
              >
                {l}
              </span>
            ))}
            <TapRing at={LANG_AT} />
          </div>
        )}
      </div>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 25, letterSpacing: "-0.02em" }}>{english ? "Bilingual" : t.title}</div>
      <div style={{ fontSize: 15, lineHeight: 1.4, color: C.mist }}>{english ? "The whole app in Spanish and English." : t.body}</div>
    </div>
  )
}

// Safety & app: block, report, install as a PWA (works offline) and switch language.
export function Safety() {
  const { vertical, u } = useLayout()
  const s = (vertical ? 1.7 : 1.32) * u

  const device = (
    <div style={{ width: 540 * s, height: 470 * s, position: "relative" }}>
      <div
        style={{
          width: 540,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          fontFamily: FONT.body,
          color: C.paper,
        }}
      >
        {TILES.map((t, i) => (
          <Tile key={t.title} index={i} />
        ))}
      </div>
    </div>
  )

  return (
    <>
      {TILES.map((t, i) => (
        <Sfx key={t.title} at={TILE_AT + i * 7} name="pop" volume={0.4} />
      ))}
      <Sfx at={LANG_AT} name="tap" volume={0.55} />
      <Stage
        caption={<Caption eyebrow="Seguridad y app" lead="Tu espacio," accent="tus reglas." body="Tú decides con quién conectas, y STARBONDS se instala en tu celular." />}
        device={device}
      />
    </>
  )
}
