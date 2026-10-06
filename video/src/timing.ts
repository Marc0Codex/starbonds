import { Easing } from "remotion"

export const FPS = 30
export const BPM = 120
/** Frames per beat at 120 BPM / 30 fps. */
export const BEAT = (60 / BPM) * FPS // 15

// Scene lengths (frames). Transitions overlap neighbours by TRANSITION frames,
// so the total is sum(scenes) - 4 * TRANSITION = 450 frames (15 s).
export const TRANSITION = 10
export const SCENES = {
  hook: 85,
  community: 85,
  match: 125,
  market: 85,
  outro: 110,
} as const
export const TOTAL_FRAMES =
  Object.values(SCENES).reduce((sum, n) => sum + n, 0) - 4 * TRANSITION

/** Absolute start frame of each scene (scenes overlap by TRANSITION). */
export const STARTS = {
  hook: 0,
  community: SCENES.hook - TRANSITION,
  match: SCENES.hook + SCENES.community - 2 * TRANSITION,
  market: SCENES.hook + SCENES.community + SCENES.match - 3 * TRANSITION,
  outro: SCENES.hook + SCENES.community + SCENES.match + SCENES.market - 4 * TRANSITION,
} as const

// Same curves as the app (globals.css).
export const EASE_OUT = Easing.bezier(0.2, 0.8, 0.2, 1)
export const EASE_SWIPE = Easing.bezier(0.6, 0, 0.3, 1)
