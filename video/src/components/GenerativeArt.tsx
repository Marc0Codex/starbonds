import type { CSSProperties } from "react"
import { useCurrentFrame } from "remotion"

// Flat geometric artwork (mirrors components/brand/generative-art.tsx), with a slow orbit.
const PALETTES = [
  ["#3b1f6b", "#bfa8ff", "#dfff4f", "#5b2a86"],
  ["#f1ebf8", "#5b2a86", "#3b1f6b", "#bfa8ff"],
  ["#dfff4f", "#3b1f6b", "#1a0f2e", "#5b2a86"],
  ["#16101f", "#bfa8ff", "#5b2a86", "#dfff4f"],
]

export function GenerativeArt({ palette, square = false, style }: { palette: number; square?: boolean; style?: CSSProperties }) {
  const frame = useCurrentFrame()
  const [bg, ring, dot, ground] = PALETTES[palette % PALETTES.length]
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: bg, overflow: "hidden", ...style }}>
      <div
        style={{
          position: "absolute",
          left: "18%",
          top: "12%",
          width: "64%",
          aspectRatio: "1",
          borderRadius: 999,
          border: `3px dashed ${ring}`,
          transform: `rotate(${frame * 0.8}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "35%",
          top: "29%",
          width: "30%",
          aspectRatio: "1",
          borderRadius: square ? 0 : 999,
          backgroundColor: dot,
          transform: square ? "rotate(45deg)" : undefined,
        }}
      />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: "24%", backgroundColor: ground }} />
    </div>
  )
}
