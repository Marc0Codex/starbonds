"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

const MOBILE_QUERY = "(max-width: 767px)"

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

// Promo video (rendered with Remotion in video/): vertical on phones, horizontal on
// larger screens. Plays muted while visible; never autoplays with reduced motion.
export function PromoVideo({ label, playLabel, pauseLabel }: { label: string; playLabel: string; pauseLabel: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const mobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
  const variant = mobile ? "vertical" : "horizontal"

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduceMotion && !userPaused) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.35 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [variant, userPaused])

  function toggle() {
    const video = ref.current
    if (!video) return
    if (video.paused) {
      setUserPaused(false)
      void video.play()
    } else {
      setUserPaused(true)
      video.pause()
    }
  }

  return (
    <div
      className={
        mobile
          ? "relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-[32px] border bg-card"
          : "relative aspect-video w-full overflow-hidden rounded-[32px] border bg-card"
      }
    >
      <video
        key={variant}
        ref={ref}
        className="size-full object-cover"
        src={`/videos/starbonds-promo-${variant}.mp4`}
        poster={`/videos/starbonds-promo-${variant}-poster.png`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? pauseLabel : playLabel}
        className="press absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-sm hover:bg-spark hover:text-spark-foreground"
      >
        {playing ? <Pause className="size-5" aria-hidden /> : <Play className="size-5" aria-hidden />}
      </button>
    </div>
  )
}
