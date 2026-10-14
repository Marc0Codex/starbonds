import type { PleiMood } from "../../../components/plei/plei-art"
import { LIKE_AT as MATCH_LIKE_AT, MATCH_AT, PASS_AT } from "./scenes/Match"
import { OUTRO_CTA_AT, OUTRO_LOGO_AT } from "./scenes/Outro"
import { SCENE_ORDER, type SceneId, STARTS } from "./timing"

/** Local frame of the intro when the star turns into Plei. */
export const INTRO_PLEI_AT = 20

/** Where Plei sits in each scene: center as a fraction of the frame, size in layout units, pupil direction. */
export type Anchor = { x: number; y: number; size: number; look: { x: number; y: number } }

const RIGHT = { x: 2.5, y: -0.5 }
const LEFT = { x: -2.5, y: -0.5 }
const UP = { x: 0, y: -2.5 }

export const ANCHORS: Record<"vertical" | "horizontal", Record<SceneId, Anchor>> = {
  vertical: {
    intro: { x: 0.5, y: 0.36, size: 400, look: { x: 0, y: 1 } },
    profile: { x: 0.13, y: 0.84, size: 210, look: RIGHT },
    community: { x: 0.87, y: 0.79, size: 210, look: LEFT },
    groups: { x: 0.25, y: 0.86, size: 250, look: UP },
    match: { x: 0.13, y: 0.6, size: 210, look: RIGHT },
    messages: { x: 0.87, y: 0.85, size: 210, look: LEFT },
    market: { x: 0.13, y: 0.85, size: 210, look: RIGHT },
    activity: { x: 0.87, y: 0.62, size: 210, look: LEFT },
    safety: { x: 0.74, y: 0.87, size: 250, look: UP },
    outro: { x: 0.5, y: 0.84, size: 320, look: UP },
  },
  horizontal: {
    intro: { x: 0.5, y: 0.35, size: 340, look: { x: 0, y: 1 } },
    profile: { x: 0.12, y: 0.84, size: 190, look: RIGHT },
    community: { x: 0.63, y: 0.82, size: 190, look: RIGHT },
    groups: { x: 0.12, y: 0.84, size: 190, look: RIGHT },
    match: { x: 0.64, y: 0.72, size: 200, look: RIGHT },
    messages: { x: 0.12, y: 0.84, size: 190, look: RIGHT },
    market: { x: 0.63, y: 0.82, size: 190, look: RIGHT },
    activity: { x: 0.12, y: 0.84, size: 190, look: RIGHT },
    safety: { x: 0.12, y: 0.84, size: 190, look: RIGHT },
    outro: { x: 0.85, y: 0.76, size: 250, look: LEFT },
  },
}

/** Plei flies to the next anchor over these frames around each transition. */
export const FLIGHT_LEAD = 8
export const FLIGHT = 24

export const flights = SCENE_ORDER.slice(1).map((id, i) => ({
  from: SCENE_ORDER[i],
  to: id,
  start: STARTS[id] - FLIGHT_LEAD,
}))

const at = (scene: SceneId, local: number) => STARTS[scene] + local

/** Mood timeline (absolute frame → mood), each entry holds until the next. */
export const MOODS: [number, PleiMood][] = [
  [0, "happy"],
  [at("profile", 0), "idle"],
  [at("profile", 76), "happy"],
  [at("groups", 0), "idle"],
  [at("groups", 38), "happy"],
  [at("match", 0), "idle"],
  [at("match", PASS_AT - 4), "meh"],
  [at("match", PASS_AT + 20), "idle"],
  [at("match", MATCH_LIKE_AT - 8), "happy"],
  [at("match", MATCH_AT), "celebrate"],
  [at("messages", 0), "happy"],
  [at("activity", 0), "idle"],
  [at("activity", 30), "happy"],
  [at("safety", 0), "idle"],
  [at("safety", 40), "happy"],
  [at("outro", OUTRO_LOGO_AT), "celebrate"],
]

export const REACTIONS: { at: number; kind: "hop" | "spin" | "bounce" }[] = [
  { at: at("intro", INTRO_PLEI_AT + 18), kind: "hop" },
  { at: at("profile", 76), kind: "hop" },
  { at: at("community", 58), kind: "bounce" },
  { at: at("community", 76), kind: "hop" },
  { at: at("groups", 39), kind: "hop" },
  { at: at("match", PASS_AT), kind: "bounce" },
  { at: at("match", MATCH_AT + 2), kind: "spin" },
  { at: at("messages", 70), kind: "hop" },
  { at: at("market", 89), kind: "hop" },
  { at: at("activity", 32), kind: "bounce" },
  { at: at("safety", 48), kind: "hop" },
  { at: at("outro", OUTRO_LOGO_AT), kind: "spin" },
  { at: at("outro", OUTRO_CTA_AT + 2), kind: "hop" },
  { at: at("outro", OUTRO_CTA_AT + 30), kind: "bounce" },
]

/** Star bursts around Plei (each also plays the sparkle effect). */
export const SPARKS: number[] = [
  at("intro", INTRO_PLEI_AT),
  at("match", MATCH_AT + 4),
  at("outro", OUTRO_LOGO_AT + 2),
]
