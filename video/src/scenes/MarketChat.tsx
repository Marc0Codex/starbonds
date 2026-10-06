import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { Headline } from "../components/Brand"
import { GenerativeArt } from "../components/GenerativeArt"
import { Stage } from "../components/Stage"
import { useLayout } from "../layout"
import { C, FONT } from "../theme"
import { EASE_OUT } from "../timing"

function Bubble({ mine, text, appear }: { mine: boolean; text: string; appear: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - appear, fps, config: { damping: 12, stiffness: 170 } })
  if (frame < appear) return null
  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "82%",
        padding: "12px 18px",
        borderRadius: 22,
        borderBottomRightRadius: mine ? 6 : 22,
        borderBottomLeftRadius: mine ? 22 : 6,
        backgroundColor: mine ? C.lavender : C.raise,
        color: mine ? C.sparkInk : C.paper,
        border: mine ? "none" : `1px solid ${C.line}`,
        fontSize: 19,
        lineHeight: 1.4,
        transform: `scale(${p}) translateY(${(1 - p) * 20}px)`,
        transformOrigin: mine ? "right bottom" : "left bottom",
      }}
    >
      {text}
    </div>
  )
}

// 9–11.5 s: a listing with a ticking price, "Contactar" press, then the chat opens.
export function MarketChat() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { vertical, u } = useLayout()

  const price = Math.round(interpolate(frame, [4, 28], [0, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT }))
  const press = frame >= 28 && frame < 36
  const ring = interpolate(frame, [28, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const chatIn = spring({ frame: frame - 32, fps, config: { damping: 15, stiffness: 120 } })
  const typing = frame >= 48 && frame < 60

  // Designed at 1 unit = 1px, scaled by `s`.
  const s = (vertical ? 1.35 : 1.02) * u

  const listing = (
    <div
      style={{
        width: 420,
        borderRadius: 30,
        overflow: "hidden",
        backgroundColor: C.card,
        border: `1px solid ${C.line}`,
        fontFamily: FONT.body,
        color: C.paper,
      }}
    >
      <div style={{ position: "relative", height: 330 }}>
        <GenerativeArt palette={1} />
        <span style={{ position: "absolute", left: 14, top: 14, backgroundColor: C.ink, fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 999 }}>
          Obra
        </span>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: C.lavender, fontVariantNumeric: "tabular-nums" }}>
          ${price}
        </div>
        <div style={{ fontSize: 20 }}>Órbita lenta</div>
        <div style={{ color: C.mist, fontSize: 15 }}>
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic" }}>por</span> Luna Ríos
        </div>
        <div style={{ position: "relative", marginTop: 8 }}>
          <div
            style={{
              backgroundColor: press ? C.spark : C.lavender,
              color: C.sparkInk,
              fontWeight: 600,
              fontSize: 17,
              textAlign: "center",
              padding: "14px 0",
              borderRadius: 999,
              transform: `scale(${press ? 0.95 : 1})`,
            }}
          >
            Contactar al artista
          </div>
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 999,
              border: `3px solid ${C.spark}`,
              opacity: ring > 0 && ring < 1 ? 1 - ring : 0,
              transform: `scale(${1 + ring * 0.12})`,
            }}
          />
        </div>
      </div>
    </div>
  )

  const chat = (
    <div
      style={{
        width: 440,
        borderRadius: 30,
        backgroundColor: C.card,
        border: `1px solid ${C.line}`,
        fontFamily: FONT.body,
        color: C.paper,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ width: 46, height: 46, borderRadius: 999, backgroundColor: C.grape, display: "grid", placeItems: "center", fontFamily: FONT.display, fontWeight: 700 }}>
          LR
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 19 }}>Luna Ríos</div>
          <div style={{ fontSize: 13, color: C.mist }}>
            <span style={{ fontFamily: FONT.serif, fontStyle: "italic", color: C.lavender }}>Sobre</span> Órbita lenta
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 230 }}>
        <Bubble mine text="¡Hola! ¿Sigue disponible?" appear={38} />
        {typing && (
          <div style={{ alignSelf: "flex-start", display: "flex", gap: 6, padding: "14px 18px", borderRadius: 22, backgroundColor: C.raise, border: `1px solid ${C.line}` }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: C.lavender,
                  transform: `translateY(${Math.sin((frame - i * 4) / 3) * 4}px)`,
                }}
              />
            ))}
          </div>
        )}
        <Bubble mine={false} text="¡Sí! Y si quieres, hagamos una colab." appear={60} />
        <Bubble mine text="¡Trato hecho!" appear={70} />
      </div>
    </div>
  )

  const device = (
    <div style={{ position: "relative", width: (vertical ? 640 : 820) * s, height: (vertical ? 900 : 640) * s }}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${s}) rotate(-3deg)`, transformOrigin: "0 0" }}>{listing}</div>
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          transform: `scale(${s}) translate(${(1 - chatIn) * 160}px, ${(1 - chatIn) * 120}px) rotate(${2 - chatIn * 0.5}deg)`,
          transformOrigin: "100% 100%",
          opacity: Math.min(1, chatIn * 1.5),
        }}
      >
        {chat}
      </div>
    </div>
  )

  return (
    <Stage
      caption={
        <Headline
          eyebrow="Mercado y mensajes"
          lead="Vende tu obra."
          accent="Conversa directo."
          size={(vertical ? 96 : 92) * u}
          align={vertical ? "center" : "left"}
        />
      }
      device={device}
    />
  )
}
