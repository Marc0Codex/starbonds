import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { Headline, StarGlyph } from "../components/Brand"
import { GenerativeArt } from "../components/GenerativeArt"
import { PhoneFrame } from "../components/PhoneFrame"
import { PleiAnimated } from "../components/PleiAnimated"
import { Stage } from "../components/Stage"
import { useLayout } from "../layout"
import { C, FONT } from "../theme"
import { EASE_OUT, EASE_SWIPE } from "../timing"

function Tag({ label, shared }: { label: string; shared: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
        padding: "5px 11px",
        borderRadius: 999,
        backgroundColor: shared ? C.plum : C.raise,
        border: `1px solid ${shared ? C.grape : C.line}`,
        color: shared ? C.paper : C.mist,
      }}
    >
      {shared && <span style={{ color: C.spark, fontWeight: 700 }}>✓</span>}
      {label}
    </span>
  )
}

function Card({ name, handle, palette, tags, badge }: { name: string; handle: string; palette: number; tags: [string, boolean][]; badge: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 30,
        overflow: "hidden",
        backgroundColor: C.card,
        border: `1px solid ${C.line}`,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT.body,
        color: C.paper,
      }}
    >
      <div style={{ position: "relative", flex: 1 }}>
        <GenerativeArt palette={palette} square={palette === 2} />
        <span
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            backgroundColor: C.ink,
            color: C.spark,
            fontWeight: 700,
            fontSize: 13,
            padding: "6px 12px",
            borderRadius: 999,
          }}
        >
          {badge}
        </span>
      </div>
      <div style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em" }}>{name}</div>
        <div style={{ color: C.mist, fontSize: 14 }}>{handle}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map(([label, shared]) => (
            <Tag key={label} label={label} shared={shared} />
          ))}
        </div>
      </div>
    </div>
  )
}

// 5–9 s: swipe right with the "Conectar" stamp, Plei cheers, then "Es un match."
export function Match() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { vertical, u } = useLayout()

  const drag = interpolate(frame, [12, 32], [0, 95], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })
  const fly = interpolate(frame, [32, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_SWIPE })
  const x = drag + fly * 460
  const rot = x / 18
  const stamp = Math.min(1, x / 90)
  const backScale = interpolate(frame, [36, 54], [0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })

  const overlay = spring({ frame: frame - 54, fps, config: { damping: 13, stiffness: 120 } })
  const mood = frame < 20 ? "idle" : frame < 54 ? "happy" : "celebrate"

  const phone = (
    <PhoneFrame height={(vertical ? 1120 : 860) * u}>
      <div style={{ padding: "28px 22px 0", fontFamily: FONT.body, color: C.paper, height: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 32, letterSpacing: "-0.03em" }}>Match</div>
        <div style={{ color: C.mist, fontSize: 15, marginTop: 4 }}>
          Artistas afines a tus{" "}
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic", color: C.lavender, fontSize: 17 }}>técnicas y objetivos</span>
        </div>

        <div style={{ position: "relative", height: 560, marginTop: 22 }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${backScale}) translateY(${(1 - backScale) * 260}px)` }}>
            <Card
              name="Mateo Cruz"
              handle="@mateo · San José"
              palette={2}
              badge="4 tags en común"
              tags={[["Fotografía", true], ["Música", true], ["Colaborar", true], ["Arte urbano", false]]}
            />
          </div>
          {fly < 1 && (
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${x}px) rotate(${rot}deg)` }}>
              <Card
                name="Luna Ríos"
                handle="@luna · CDMX"
                palette={0}
                badge="3 tags en común"
                tags={[["Pintura", true], ["Abstracto", true], ["Colaborar", true], ["Exponer", false]]}
              />
              <span
                style={{
                  position: "absolute",
                  left: 26,
                  top: 110,
                  transform: "rotate(-12deg)",
                  border: `4px solid ${C.spark}`,
                  color: C.spark,
                  borderRadius: 14,
                  padding: "4px 16px",
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: 34,
                  textTransform: "uppercase",
                  opacity: stamp,
                }}
              >
                Conectar
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 22, marginTop: 26 }}>
          <div style={{ width: 62, height: 62, borderRadius: 999, border: `1px solid ${C.line}`, backgroundColor: C.card, display: "grid", placeItems: "center", fontSize: 26, color: C.paper }}>
            ✕
          </div>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 999,
              backgroundColor: frame >= 26 && frame < 40 ? C.spark : C.lavender,
              display: "grid",
              placeItems: "center",
              transform: `scale(${frame >= 26 && frame < 34 ? 0.9 : 1})`,
            }}
          >
            <StarGlyph size={34} color={C.sparkInk} />
          </div>
          <div style={{ width: 62, height: 62, borderRadius: 999, border: `1px solid ${C.line}`, backgroundColor: C.card }} />
        </div>
      </div>

      {/* match overlay */}
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
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 60,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              transform: `translateY(${(1 - overlay) * 40}px)`,
            }}
          >
            Es un{" "}
            <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, color: C.spark }}>match.</span>
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.5, opacity: interpolate(frame, [64, 76], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
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
              opacity: interpolate(frame, [72, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            Enviar mensaje
          </div>
        </div>
      )}
    </PhoneFrame>
  )

  const pleiSize = (vertical ? 250 : 230) * u

  return (
    <Stage
      caption={
        <Headline
          eyebrow="Match con Plei"
          lead="Desliza."
          accent="Conecta."
          size={(vertical ? 120 : 110) * u}
          align={vertical ? "center" : "left"}
        />
      }
      device={phone}
      extra={
        <div style={{ position: "absolute", left: -pleiSize * 0.62, bottom: pleiSize * 0.05 }}>
          <PleiAnimated
            size={pleiSize}
            mood={mood}
            look={{ x: frame < 46 ? Math.min(3.5, x / 25) : 2, y: -1 }}
            reactions={[
              { at: 22, kind: "hop" },
              { at: 56, kind: "spin" },
            ]}
            sparksAt={58}
          />
        </div>
      }
    />
  )
}
