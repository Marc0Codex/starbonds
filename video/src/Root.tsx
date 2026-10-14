import { Composition } from "remotion"

import { Explainer } from "./explainer/Explainer"
import { TOTAL_FRAMES as EXPLAINER_FRAMES } from "./explainer/timing"
import { Promo } from "./Promo"
import { FPS, TOTAL_FRAMES } from "./timing"

export function Root() {
  return (
    <>
      <Composition id="PromoVertical" component={Promo} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL_FRAMES} />
      <Composition id="PromoHorizontal" component={Promo} width={1920} height={1080} fps={FPS} durationInFrames={TOTAL_FRAMES} />
      <Composition id="ExplainerVertical" component={Explainer} width={1080} height={1920} fps={FPS} durationInFrames={EXPLAINER_FRAMES} />
      <Composition id="ExplainerHorizontal" component={Explainer} width={1920} height={1080} fps={FPS} durationInFrames={EXPLAINER_FRAMES} />
    </>
  )
}
