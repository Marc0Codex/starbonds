import type { CSSProperties, ReactNode } from "react"

import { C } from "../theme"

export const SCREEN_W = 390
export const SCREEN_H = 844

// A phone-shaped frame. Content is authored at 390×844 and scaled to `height`.
export function PhoneFrame({ height, children, style }: { height: number; children: ReactNode; style?: CSSProperties }) {
  const scale = height / SCREEN_H
  return (
    <div
      style={{
        width: SCREEN_W * scale,
        height,
        borderRadius: 56 * scale,
        border: `${10 * scale}px solid ${C.raise}`,
        backgroundColor: C.ink,
        overflow: "hidden",
        position: "relative",
        boxSizing: "content-box",
        ...style,
      }}
    >
      <div style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${scale})`, transformOrigin: "0 0", position: "relative" }}>
        {children}
      </div>
    </div>
  )
}
