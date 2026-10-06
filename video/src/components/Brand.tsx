import type { CSSProperties, ReactNode } from "react"

import { STAR_PATH } from "../../../components/brand/star-path"
import { C, FONT } from "../theme"

export function StarGlyph({ size, color = C.lavender, style }: { size: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: "block", overflow: "visible", ...style }}>
      <path d={STAR_PATH} fill={color} />
    </svg>
  )
}

/** Eyebrow + big Syne headline with an Instrument Serif italic accent. */
export function Headline({
  eyebrow,
  lead,
  accent,
  size,
  align = "left",
  style,
}: {
  eyebrow?: ReactNode
  lead: ReactNode
  accent?: ReactNode
  size: number
  align?: "left" | "center"
  style?: CSSProperties
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.28, textAlign: align, ...style }}>
      {eyebrow && (
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: size * 0.24,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.spark,
            fontWeight: 600,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.03em", color: C.paper }}>
        {lead}
        {accent && <br />}
        {accent && (
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em", color: C.lavender }}>
            {accent}
          </span>
        )}
      </div>
    </div>
  )
}
