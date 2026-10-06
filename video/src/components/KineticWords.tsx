import type { CSSProperties } from "react"
import { interpolate, useCurrentFrame } from "remotion"

import { EASE_OUT } from "../timing"

// Word-by-word masked rise (same feel as the app's `.reveal`).
export function KineticWords({
  text,
  start,
  stagger = 4,
  duration = 16,
  style,
  wordStyle,
}: {
  text: string
  start: number
  stagger?: number
  duration?: number
  style?: CSSProperties
  wordStyle?: CSSProperties
}) {
  const frame = useCurrentFrame()
  const words = text.split(" ")
  return (
    <span style={style}>
      {words.map((word, i) => {
        const t = interpolate(frame, [start + i * stagger, start + i * stagger + duration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        })
        return (
          <span
            key={`${word}-${i}`}
            style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.1em" }}
          >
            <span style={{ display: "inline-block", transform: `translateY(${(1 - t) * 110}%)`, ...wordStyle }}>
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        )
      })}
    </span>
  )
}
