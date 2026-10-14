import { interpolate, useCurrentFrame } from "remotion"

import { StarGlyph } from "../../components/Brand"
import { GenerativeArt } from "../../components/GenerativeArt"
import { PhoneFrame } from "../../components/PhoneFrame"
import { Stage } from "../../components/Stage"
import { useLayout } from "../../layout"
import { C, FONT } from "../../theme"
import { Avatar, Caption, Chip, Icon, Sfx, TapRing, usePop, useProgress } from "../ui"

const TEXT = "Bocetos de mi próxima serie."
const TYPE_FROM = 8
const TYPE_TO = 30
const PUBLISH_AT = 34
const LIKE_AT = 58
const COMMENT_AT = 74

// Community: write a post, publish it, get a like and a comment.
export function Community() {
  const frame = useCurrentFrame()
  const { vertical, u } = useLayout()

  const typed = Math.round(interpolate(frame, [TYPE_FROM, TYPE_TO], [0, TEXT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
  const published = frame >= PUBLISH_AT + 4
  const post = useProgress(PUBLISH_AT + 4, PUBLISH_AT + 22)
  const liked = frame >= LIKE_AT
  const heart = usePop(LIKE_AT, 7, 220)
  const comment = usePop(COMMENT_AT, 13, 160)
  const caret = Math.floor(frame / 8) % 2 === 0

  const phone = (
    <PhoneFrame height={(vertical ? 1060 : 860) * u}>
      <div style={{ padding: "26px 22px 0", fontFamily: FONT.body, color: C.paper }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StarGlyph size={24} />
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 18 }}>STARBONDS</span>
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 20, borderBottom: `1px solid ${C.line}` }}>
          <span style={{ paddingBottom: 12, fontWeight: 600, fontSize: 16, borderBottom: `2px solid ${C.lavender}` }}>Siguiendo</span>
          <span style={{ paddingBottom: 12, color: C.mist, fontSize: 16 }}>Descubrir</span>
          <span style={{ paddingBottom: 12, color: C.mist, fontSize: 16 }}>Grupos</span>
        </div>

        {/* composer */}
        <div style={{ marginTop: 18, padding: 16, borderRadius: 22, backgroundColor: C.card, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", minHeight: 40 }}>
            <Avatar initials="LR" color={C.grape} size={40} />
            <span style={{ fontSize: 16, color: published || typed === 0 ? C.mist : C.paper }}>
              {published || typed === 0 ? "Comparte tu proceso, una obra o una idea…" : TEXT.slice(0, typed)}
              {!published && typed > 0 && <span style={{ opacity: caret ? 1 : 0, color: C.lavender }}>|</span>}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Chip>Obra terminada</Chip>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  backgroundColor: frame >= PUBLISH_AT && frame < PUBLISH_AT + 8 ? C.spark : C.lavender,
                  color: C.sparkInk,
                  fontWeight: 600,
                  fontSize: 15,
                  padding: "9px 20px",
                  borderRadius: 999,
                  transform: `scale(${frame >= PUBLISH_AT && frame < PUBLISH_AT + 5 ? 0.92 : 1})`,
                }}
              >
                Publicar
              </div>
              <TapRing at={PUBLISH_AT} />
            </div>
          </div>
        </div>

        {/* the new post */}
        {published && (
          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              opacity: post,
              transform: `translateY(${(1 - post) * 80}px) scale(${0.96 + post * 0.04})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar initials="LR" color={C.grape} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Luna Ríos</div>
                <div style={{ color: C.mist, fontSize: 13 }}>@luna · ahora</div>
              </div>
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.45 }}>{TEXT}</div>
            <div style={{ position: "relative", height: 250, borderRadius: 22, overflow: "hidden", border: `1px solid ${C.line}` }}>
              <GenerativeArt palette={3} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
              <div style={{ position: "relative", transform: `scale(${liked ? 0.6 + heart * 0.4 : 1})` }}>
                <Icon name="heart" size={26} color={liked ? C.lavender : C.paper} fill={liked ? C.lavender : "none"} />
                <TapRing at={LIKE_AT} inset={-12} />
              </div>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{liked ? 24 : 23}</span>
              <div style={{ marginLeft: 16 }}>
                <Icon name="message" size={24} />
              </div>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{frame >= COMMENT_AT ? 1 : 0}</span>
            </div>

            {frame >= COMMENT_AT && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  transform: `translateY(${(1 - comment) * 30}px)`,
                  opacity: Math.min(1, comment * 1.5),
                }}
              >
                <Avatar initials="AT" color={C.plum} size={34} />
                <div style={{ padding: "10px 14px", borderRadius: 18, borderTopLeftRadius: 6, backgroundColor: C.raise, border: `1px solid ${C.line}`, fontSize: 15, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600 }}>Aiko</span> ¡Me encanta la paleta!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PhoneFrame>
  )

  return (
    <>
      {[10, 16, 22, 28].map((at) => (
        <Sfx key={at} at={at} name="tick" volume={0.2} />
      ))}
      <Sfx at={PUBLISH_AT} name="tap" volume={0.6} />
      <Sfx at={PUBLISH_AT + 4} name="pop" volume={0.5} />
      <Sfx at={LIKE_AT} name="like" volume={0.55} />
      <Sfx at={COMMENT_AT} name="message" volume={0.5} />
      <Stage
        caption={
          <Caption
            eyebrow="Comunidad"
            lead="Comparte"
            accent="tu proceso."
            body="Publica, recibe me gusta y comentarios, y sigue a quien te inspira."
          />
        }
        device={phone}
      />
    </>
  )
}
