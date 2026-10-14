import type { ComponentType } from "react"
import { linearTiming, type TransitionPresentation, TransitionSeries } from "@remotion/transitions"
import { fade } from "@remotion/transitions/fade"
import { iris } from "@remotion/transitions/iris"
import { slide } from "@remotion/transitions/slide"
import { wipe } from "@remotion/transitions/wipe"
import { AbsoluteFill } from "remotion"

import { StarField } from "../components/StarField"
import { useLayout } from "../layout"
import { C, FONT } from "../theme"
import { EASE_SWIPE } from "../timing"
import { PleiGuide } from "./PleiGuide"
import { Activity } from "./scenes/Activity"
import { Community } from "./scenes/Community"
import { Groups } from "./scenes/Groups"
import { Intro } from "./scenes/Intro"
import { Market } from "./scenes/Market"
import { Match } from "./scenes/Match"
import { Messages } from "./scenes/Messages"
import { Outro } from "./scenes/Outro"
import { Profile } from "./scenes/Profile"
import { Safety } from "./scenes/Safety"
import { SCENE_ORDER, type SceneId, SCENES, STARTS, TRANSITION } from "./timing"
import { Sfx } from "./ui"

const COMPONENTS: Record<SceneId, ComponentType> = {
  intro: Intro,
  profile: Profile,
  community: Community,
  groups: Groups,
  match: Match,
  messages: Messages,
  market: Market,
  activity: Activity,
  safety: Safety,
  outro: Outro,
}

// 30 s explainer: Plei walks through every feature of the app.
export function Explainer() {
  const { width, height } = useLayout()
  const timing = linearTiming({ durationInFrames: TRANSITION, easing: EASE_SWIPE })

  // Transition into each scene (index = scene index - 1). Slides follow Plei's direction of travel.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const into: Record<Exclude<SceneId, "intro">, TransitionPresentation<any>> = {
    profile: iris({ width, height }),
    community: slide({ direction: "from-right" }),
    groups: wipe({ direction: "from-right" }),
    match: slide({ direction: "from-bottom" }),
    messages: slide({ direction: "from-right" }),
    market: wipe({ direction: "from-bottom-left" }),
    activity: slide({ direction: "from-top" }),
    safety: fade(),
    outro: iris({ width, height }),
  }

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, fontFamily: FONT.body }}>
      <TransitionSeries>
        {SCENE_ORDER.flatMap((id) => {
          const Scene = COMPONENTS[id]
          const items = []
          if (id !== "intro") {
            items.push(<TransitionSeries.Transition key={`${id}-in`} presentation={into[id]} timing={timing} />)
          }
          items.push(
            <TransitionSeries.Sequence key={id} durationInFrames={SCENES[id]}>
              {/* Each scene is opaque, with the star field synced to the absolute frame. */}
              <AbsoluteFill>
                <StarField offset={STARTS[id]} />
                <Scene />
              </AbsoluteFill>
            </TransitionSeries.Sequence>,
          )
          return items
        })}
      </TransitionSeries>

      {SCENE_ORDER.slice(1, -1).map((id) => (
        <Sfx key={id} at={STARTS[id] - 6} name="whoosh" volume={0.35} />
      ))}

      <PleiGuide />
    </AbsoluteFill>
  )
}
