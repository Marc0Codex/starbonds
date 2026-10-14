import type { CSSProperties, ReactNode } from "react"
import { Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion"

import { Headline } from "../components/Brand"
import { useLayout } from "../layout"
import { C, FONT } from "../theme"
import { EASE_OUT } from "../timing"

export type SfxName =
  | "whoosh"
  | "swipe"
  | "pop"
  | "tap"
  | "tick"
  | "like"
  | "message"
  | "notify"
  | "chime"
  | "sparkle"
  | "rise"
  | "hit"

/** Plays a synthesized effect (public/sfx, see scripts/make-sfx.mjs) at a frame of the current sequence. */
export function Sfx({ at, name, volume = 0.6 }: { at: number; name: SfxName; volume?: number }) {
  return (
    <Sequence from={at} durationInFrames={45} layout="none">
      <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  )
}

/** 0→1 eased progress between two frames. */
export function useProgress(from: number, to: number, easing = EASE_OUT) {
  const frame = useCurrentFrame()
  return interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing })
}

/** Springy 0→1 pop that starts at `at`. */
export function usePop(at: number, damping = 11, stiffness = 170) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - at, fps, config: { damping, stiffness } })
}

/** Scene caption: eyebrow + headline + one explanatory line. */
export function Caption({ eyebrow, lead, accent, body }: { eyebrow: string; lead: string; accent: string; body: string }) {
  const { vertical, u } = useLayout()
  const bodyIn = useProgress(10, 28)
  const size = (vertical ? 100 : 100) * u
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start" }}>
      <Headline eyebrow={eyebrow} lead={lead} accent={accent} size={size} align={vertical ? "center" : "left"} />
      <div
        style={{
          marginTop: 30 * u,
          maxWidth: (vertical ? 860 : 700) * u,
          fontFamily: FONT.body,
          fontSize: 36 * u,
          lineHeight: 1.35,
          color: C.mist,
          textAlign: vertical ? "center" : "left",
          opacity: bodyIn,
          transform: `translateY(${(1 - bodyIn) * 16 * u}px)`,
        }}
      >
        {body}
      </div>
    </div>
  )
}

export function Avatar({ initials, color, size = 44 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: color,
        display: "grid",
        placeItems: "center",
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: size * 0.34,
        color: C.paper,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

export function Chip({ children, active = false, style }: { children: ReactNode; active?: boolean; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
        fontWeight: 500,
        padding: "7px 13px",
        borderRadius: 999,
        backgroundColor: active ? C.lavender : C.raise,
        color: active ? C.sparkInk : C.paper,
        border: `1px solid ${active ? C.lavender : C.line}`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/** Expanding ring that marks a tap at frame `at`. Place inside a relatively positioned box. */
export function TapRing({ at, radius = 999, inset = -6 }: { at: number; radius?: number; inset?: number }) {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [at, at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  if (t <= 0 || t >= 1) return null
  return (
    <div
      style={{
        position: "absolute",
        inset,
        borderRadius: radius,
        border: `3px solid ${C.spark}`,
        opacity: 1 - t,
        transform: `scale(${1 + t * 0.15})`,
        pointerEvents: "none",
      }}
    />
  )
}

// Minimal line icons (24×24, stroke), drawn for the video.
export const ICONS = {
  heart: ["M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"],
  message: ["M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.5-5.2A8.5 8.5 0 1 1 21 12Z"],
  bell: ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.94 1.94 0 0 0 3.4 0"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z", "m9 12 2 2 4-4"],
  flag: ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z", "M4 22v-7"],
  phone: ["M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z", "M12 7v6", "m9 10 3 3 3-3", "M10 18h4"],
  globe: ["M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  check: ["M20 6 9 17l-5-5"],
  plus: ["M12 5v14", "M5 12h14"],
  userPlus: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8", "M19 8v6", "M22 11h-6"],
} as const

export function Icon({
  name,
  size = 24,
  color = C.paper,
  fill = "none",
  strokeWidth = 1.8,
}: {
  name: keyof typeof ICONS
  size?: number
  color?: string
  fill?: string
  strokeWidth?: number
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

/** App header row used inside phone screens. */
export function ScreenTitle({ title, accent }: { title: string; accent?: string }) {
  return (
    <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 30, letterSpacing: "-0.03em", color: C.paper }}>
      {title}
      {accent && (
        <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, color: C.lavender, letterSpacing: "-0.01em" }}> {accent}</span>
      )}
    </div>
  )
}
