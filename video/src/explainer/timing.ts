// 30 s feature explainer: 900 frames at 30 fps.
// Scenes overlap their neighbours by TRANSITION frames, so
// total = sum(scenes) - 9 * TRANSITION = 900.
export const TRANSITION = 10

export const SCENE_ORDER = [
  "intro",
  "profile",
  "community",
  "groups",
  "match",
  "messages",
  "market",
  "activity",
  "safety",
  "outro",
] as const
export type SceneId = (typeof SCENE_ORDER)[number]

export const SCENES: Record<SceneId, number> = {
  intro: 100,
  profile: 105,
  community: 105,
  groups: 75,
  match: 120,
  messages: 90,
  market: 110,
  activity: 75,
  safety: 75,
  outro: 135,
}

/** Absolute start frame of each scene. */
export const STARTS = SCENE_ORDER.reduce(
  (acc, id, i) => {
    const prev = SCENE_ORDER[i - 1]
    acc[id] = prev === undefined ? 0 : acc[prev] + SCENES[prev] - TRANSITION
    return acc
  },
  {} as Record<SceneId, number>,
)

export const TOTAL_FRAMES =
  STARTS.outro + SCENES.outro // 900
