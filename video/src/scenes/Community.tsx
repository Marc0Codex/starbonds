import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { StarGlyph } from "../components/Brand"
import { Headline } from "../components/Brand"
import { GenerativeArt } from "../components/GenerativeArt"
import { PhoneFrame } from "../components/PhoneFrame"
import { Stage } from "../components/Stage"
import { useLayout } from "../layout"
import { C, FONT } from "../theme"
import { EASE_OUT } from "../timing"

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        backgroundColor: color,
        display: "grid",
        placeItems: "center",
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: 15,
        color: C.paper,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function HeartIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? C.lavender : "none"} stroke={filled ? C.lavender : C.paper} strokeWidth="1.8" strokeLinejoin="round">
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
    </svg>
  )
}

// 2.5–5 s: the Discover feed — posts rise, "Nueva voz" pops, a like lands.
export function Community() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { vertical, u } = useLayout()

  const rise = (start: number) =>
    interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })
  const badge = spring({ frame: frame - 28, fps, config: { damping: 9, stiffness: 180 } })
  const liked = frame >= 46
  const heartPop = spring({ frame: frame - 46, fps, config: { damping: 7, stiffness: 220 } })
  const tap = interpolate(frame, [40, 46, 56], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const scrollY = interpolate(frame, [52, 85], [0, -120], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })

  const phone = (
    <PhoneFrame height={(vertical ? 1180 : 860) * u}>
      <div style={{ padding: "26px 22px 0", fontFamily: FONT.body, color: C.paper }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StarGlyph size={24} />
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 18 }}>STARBONDS</span>
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 22, borderBottom: `1px solid ${C.line}` }}>
          <span style={{ paddingBottom: 12, color: C.mist, fontSize: 16 }}>Siguiendo</span>
          <span style={{ paddingBottom: 10, fontWeight: 600, fontSize: 16, borderBottom: `2px solid ${C.lavender}` }}>Descubrir</span>
        </div>

        {/* Scroll viewport: posts are clipped below the tabs while the feed scrolls. */}
        <div style={{ height: 700, overflow: "hidden", margin: "0 -22px", padding: "0 22px" }}>
        <div style={{ transform: `translateY(${scrollY}px)`, display: "flex", flexDirection: "column", gap: 26, marginTop: 22 }}>
          {/* post 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: rise(6), transform: `translateY(${(1 - rise(6)) * 60}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar initials="LR" color={C.grape} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Luna Ríos</div>
                <div style={{ color: C.mist, fontSize: 13 }}>@luna · hace 2 h</div>
              </div>
              <span
                style={{
                  backgroundColor: C.spark,
                  color: C.sparkInk,
                  fontWeight: 700,
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 999,
                  transform: `scale(${badge})`,
                }}
              >
                Nueva voz
              </span>
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.45 }}>Terminé «Órbita lenta», óleo sobre lino.</div>
            <div style={{ position: "relative", height: 330, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.line}` }}>
              <GenerativeArt palette={0} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
              <div style={{ transform: `scale(${liked ? 0.6 + heartPop * 0.4 : 1})`, position: "relative" }}>
                <HeartIcon filled={liked} size={26} />
                <div
                  style={{
                    position: "absolute",
                    left: -14,
                    top: -14,
                    width: 54,
                    height: 54,
                    borderRadius: 999,
                    border: `3px solid ${C.spark}`,
                    opacity: tap,
                    transform: `scale(${0.6 + tap * 0.6})`,
                  }}
                />
              </div>
              <span style={{ fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{liked ? 42 : 41}</span>
              <span style={{ marginLeft: 14, color: C.mist, fontSize: 15 }}>9 comentarios</span>
            </div>
          </div>

          {/* post 2 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 18,
              borderRadius: 24,
              backgroundColor: C.card,
              border: `1px solid ${C.line}`,
              opacity: rise(16),
              transform: `translateY(${(1 - rise(16)) * 80}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar initials="AT" color={C.plum} />
              <div style={{ fontWeight: 600, fontSize: 15 }}>Aiko Tanaka</div>
            </div>
            <span
              style={{
                alignSelf: "flex-start",
                backgroundColor: C.plum,
                border: `1px solid ${C.grape}`,
                fontSize: 13,
                padding: "5px 12px",
                borderRadius: 999,
              }}
            >
              Busca colaboración
            </span>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Busco ilustradora para un fanzine de cerámica.
            </div>
          </div>
        </div>
        </div>
      </div>
    </PhoneFrame>
  )

  return (
    <Stage
      caption={
        <Headline
          eyebrow="Comunidad"
          lead="Que impulsa"
          accent="voces nuevas"
          size={(vertical ? 104 : 104) * u}
          align={vertical ? "center" : "left"}
        />
      }
      device={phone}
    />
  )
}
