import type { ReactNode } from "react"
import { linearTiming, TransitionSeries } from "@remotion/transitions"
import { iris } from "@remotion/transitions/iris"
import { slide } from "@remotion/transitions/slide"
import { wipe } from "@remotion/transitions/wipe"
import { AbsoluteFill } from "remotion"

import { StarField } from "./components/StarField"
import { useLayout } from "./layout"
import { Community } from "./scenes/Community"
import { Hook } from "./scenes/Hook"
import { MarketChat } from "./scenes/MarketChat"
import { Match } from "./scenes/Match"
import { Outro } from "./scenes/Outro"
import { C, FONT } from "./theme"
import { EASE_SWIPE, SCENES, STARTS, TRANSITION } from "./timing"

// Each scene is opaque (its own star field, synced to the absolute frame) so
// transitions read as clean wipes instead of two layers overlapping.
function Scene({ start, children }: { start: number; children: ReactNode }) {
  return (
    <AbsoluteFill>
      <StarField offset={start} />
      {children}
    </AbsoluteFill>
  )
}

// 15 s promo: Hook → Community → Match (Plei) → Market + Chat → Outro.
export function Promo() {
  const { width, height } = useLayout()
  const timing = linearTiming({ durationInFrames: TRANSITION, easing: EASE_SWIPE })

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, fontFamily: FONT.body }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
          <Scene start={STARTS.hook}>
            <Hook />
          </Scene>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={iris({ width, height })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENES.community}>
          <Scene start={STARTS.community}>
            <Community />
          </Scene>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENES.match}>
          <Scene start={STARTS.match}>
            <Match />
          </Scene>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom-left" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENES.market}>
          <Scene start={STARTS.market}>
            <MarketChat />
          </Scene>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={iris({ width, height })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENES.outro}>
          <Scene start={STARTS.outro}>
            <Outro />
          </Scene>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  )
}
