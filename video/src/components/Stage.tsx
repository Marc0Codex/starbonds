import type { ReactNode } from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { useLayout } from "../layout"
import { EASE_OUT } from "../timing"

// Shared scene layout: caption + device. Vertical stacks them; horizontal puts them side by side.
export function Stage({ caption, device, extra }: { caption: ReactNode; device: ReactNode; extra?: ReactNode }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { vertical, u } = useLayout()

  const captionIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })
  const deviceIn = spring({ frame: frame - 3, fps, config: { damping: 15, stiffness: 110 } })
  // Gentle continuous camera drift.
  const driftY = Math.sin(frame / 30) * 8 * u
  const tilt = interpolate(deviceIn, [0, 1], [-8, -2]) + Math.sin(frame / 40) * 0.8

  return (
    <AbsoluteFill
      style={{
        flexDirection: vertical ? "column" : "row",
        alignItems: "center",
        justifyContent: vertical ? "flex-start" : "center",
        padding: vertical ? `${150 * u}px ${80 * u}px` : `0 ${150 * u}px`,
        gap: vertical ? 70 * u : 120 * u,
      }}
    >
      <div
        style={{
          flex: vertical ? "0 0 auto" : "1 1 0",
          width: vertical ? "100%" : undefined,
          opacity: captionIn,
          transform: `translateY(${(1 - captionIn) * 40 * u}px)`,
        }}
      >
        {caption}
      </div>
      <div
        style={{
          position: "relative",
          flex: "0 0 auto",
          transform: `translateY(${(1 - deviceIn) * 600 * u + driftY}px) rotate(${tilt}deg)`,
        }}
      >
        {device}
        {extra}
      </div>
    </AbsoluteFill>
  )
}
