import { Composition } from "remotion"

import { Promo } from "./Promo"
import { FPS, TOTAL_FRAMES } from "./timing"

export function Root() {
  return (
    <>
      <Composition id="PromoVertical" component={Promo} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL_FRAMES} />
      <Composition id="PromoHorizontal" component={Promo} width={1920} height={1080} fps={FPS} durationInFrames={TOTAL_FRAMES} />
    </>
  )
}
