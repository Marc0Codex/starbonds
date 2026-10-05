"use client"

import { Check, RotateCcw, SlidersHorizontal, User, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { recordSwipe } from "@/app/(app)/match/actions"
import { GenerativeArt } from "@/components/brand/generative-art"
import { Star } from "@/components/brand/star"
import { DemoBadge } from "@/components/demo-badge"
import { Plei, type PleiMood } from "@/components/plei/plei"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { buttonVariants } from "@/components/ui/button"
import type { Candidate } from "@/lib/match"
import { publicUrl } from "@/lib/storage"
import { tagLabel } from "@/lib/tags"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

const SWIPE_THRESHOLD = 110
const LEAVE_MS = 420

type Drag = { x: number; y: number; startX: number; startY: number; active: boolean; moved: boolean }
type MatchInfo = { name: string; conversationId: string | null; demo?: boolean }

export function MatchDeck({ candidates, tags }: { candidates: Candidate[]; tags: Tables<"tags">[] }) {
  const t = useTranslations("match")
  const tp = useTranslations("plei")
  const locale = useLocale()
  const router = useRouter()
  const tips = tp.raw("tips") as string[]

  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState<Drag>({ x: 0, y: 0, startX: 0, startY: 0, active: false, moved: false })
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null)
  const [plei, setPlei] = useState<{ mood: PleiMood; message: string }>({ mood: "idle", message: tp("intro") })
  const [tipIndex, setTipIndex] = useState(0)
  const [match, setMatch] = useState<MatchInfo | null>(null)
  const [, startTransition] = useTransition()
  const cardRef = useRef<HTMLDivElement>(null)

  const tagById = new Map(tags.map((tag) => [tag.id, tag]))
  const badgeFor = (c: Candidate) =>
    c.sharedTagIds.length > 0 ? t("shared", { count: c.sharedTagIds.length }) : t("noShared")
  const current = candidates[index]
  const next = candidates[index + 1]
  const empty = !current

  // Plei leans into the drag direction before you let go.
  const dragMood: PleiMood | null =
    drag.active && drag.x > 60 ? "happy" : drag.active && drag.x < -60 ? "meh" : null
  const pleiMood: PleiMood = empty ? "sleepy" : (dragMood ?? plei.mood)
  const pleiMessage = empty
    ? tp("empty")
    : dragMood === "happy"
      ? tp("dragRight")
      : dragMood === "meh"
        ? tp("dragLeft")
        : plei.message

  function decide(direction: "left" | "right") {
    if (!current || leaving) return
    const target = current
    setLeaving(direction)
    setDrag((d) => ({ ...d, active: false, x: 0, y: 0 }))
    setPlei(
      direction === "right" ? { mood: "happy", message: tp("liked") } : { mood: "meh", message: tp("passed") }
    )

    // Demo artists (lib/demo.ts): nothing is saved, so they come back on refresh.
    if (target.demo) {
      if (direction === "right" && target.demo.likesYou) {
        setTimeout(() => {
          setMatch({ name: target.displayName, conversationId: null, demo: true })
          setPlei({ mood: "celebrate", message: tp("matched") })
        }, LEAVE_MS)
      }
      setTimeout(() => {
        setIndex((i) => i + 1)
        setLeaving(null)
      }, LEAVE_MS)
      return
    }

    startTransition(async () => {
      const result = await recordSwipe(target.id, direction === "right" ? "like" : "pass")
      if (!result.ok) {
        toast.error(t("error"))
        return
      }
      if (result.match) {
        setMatch({ name: target.displayName, conversationId: result.match.conversationId })
        setPlei({ mood: "celebrate", message: tp("matched") })
      }
    })

    setTimeout(() => {
      setIndex((i) => i + 1)
      setLeaving(null)
    }, LEAVE_MS)
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (leaving || (event.target as HTMLElement).closest("a,button")) return
    cardRef.current?.setPointerCapture(event.pointerId)
    setDrag({ x: 0, y: 0, startX: event.clientX, startY: event.clientY, active: true, moved: false })
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.active) return
    const x = event.clientX - drag.startX
    const y = event.clientY - drag.startY
    setDrag((d) => ({ ...d, x, y, moved: d.moved || Math.hypot(x, y) > 6 }))
  }

  function onPointerUp() {
    if (!drag.active) return
    if (drag.x > SWIPE_THRESHOLD) return decide("right")
    if (drag.x < -SWIPE_THRESHOLD) return decide("left")
    setDrag((d) => ({ ...d, active: false, x: 0, y: 0 }))
  }

  function petPlei() {
    if (empty) return
    setTipIndex((i) => (i + 1) % tips.length)
    setPlei({ mood: "happy", message: tips[tipIndex] })
  }

  const topStyle: React.CSSProperties = leaving
    ? {
        transform: `translateX(${leaving === "right" ? 140 : -140}%) rotate(${leaving === "right" ? 18 : -18}deg)`,
        opacity: 0,
        transition: `transform ${LEAVE_MS}ms var(--ease-swipe), opacity ${LEAVE_MS}ms ease`,
      }
    : drag.active
      ? { transform: `translate(${drag.x}px, ${drag.y * 0.3}px) rotate(${drag.x / 18}deg)`, transition: "none" }
      : { transform: "none", transition: "transform 450ms var(--ease-spring)" }

  const likeOpacity = Math.max(0, Math.min(1, drag.x / SWIPE_THRESHOLD))
  const passOpacity = Math.max(0, Math.min(1, -drag.x / SWIPE_THRESHOLD))

  return (
    <div className="flex flex-col gap-6">
      <Plei mood={pleiMood} message={pleiMessage} onPet={petPlei} size={104} />

      <div className="relative mx-auto h-[min(600px,70dvh)] w-full max-w-[420px]">
        {empty ? (
          <div className="rise-in absolute inset-0 flex flex-col items-start justify-center gap-5 rounded-[32px] border border-dashed p-8">
            <h2 className="text-[clamp(2rem,6vw,2.75rem)] font-extrabold leading-none">
              {t("emptyTitle")} <span className="serif-accent text-primary">{t("emptyAccent")}</span>
            </h2>
            <p className="text-muted-foreground">{t("emptyBody")}</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/profile/edit" className={cn(buttonVariants(), "press")}>
                <SlidersHorizontal aria-hidden />
                {t("editTags")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIndex(0)
                  router.refresh()
                }}
                className={cn(buttonVariants({ variant: "outline" }), "press")}
              >
                <RotateCcw aria-hidden />
                {t("refresh")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {next && (
              <div
                key={next.id}
                aria-hidden
                className="absolute inset-0 scale-[0.95] translate-y-4 rounded-[32px] transition-transform duration-500"
              >
                <CandidateCard candidate={next} tagById={tagById} locale={locale} badge={badgeFor(next)} />
              </div>
            )}
            <div
              key={current.id}
              ref={cardRef}
              role="group"
              aria-roledescription="card"
              aria-label={current.displayName}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
              style={topStyle}
            >
              {/* rise-in lives on an inner wrapper so its fill-mode never overrides the drag transform */}
              <div className="rise-in size-full">
                <CandidateCard candidate={current} tagById={tagById} locale={locale} badge={badgeFor(current)} />
              </div>
              <span
                aria-hidden
                className="pointer-events-none absolute left-6 top-24 -rotate-12 rounded-xl border-4 border-spark px-4 py-1 font-heading text-3xl font-extrabold uppercase text-spark"
                style={{ opacity: likeOpacity }}
              >
                {t("stampLike")}
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute right-6 top-24 rotate-12 rounded-xl border-4 border-foreground px-4 py-1 font-heading text-3xl font-extrabold uppercase"
                style={{ opacity: passOpacity }}
              >
                {t("stampPass")}
              </span>
            </div>
          </>
        )}
      </div>

      {!empty && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => decide("left")}
              disabled={Boolean(leaving)}
              aria-label={t("pass")}
              className="press grid size-16 place-items-center rounded-full border bg-card hover:border-foreground disabled:opacity-50"
            >
              <X className="size-7" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => decide("right")}
              disabled={Boolean(leaving)}
              aria-label={t("like")}
              className="press grid size-20 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-spark hover:text-spark-foreground disabled:opacity-50"
            >
              <Star className="size-9" />
            </button>
            {current.demo ? (
              <span
                aria-hidden
                className="grid size-16 place-items-center rounded-full border bg-card opacity-40"
              >
                <User className="size-6" />
              </span>
            ) : (
              <Link
                href={`/u/${current.username}`}
                aria-label={t("viewProfile", { name: current.displayName })}
                className="press grid size-16 place-items-center rounded-full border bg-card hover:border-primary"
              >
                <User className="size-6" aria-hidden />
              </Link>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("counter", { current: index + 1, total: candidates.length })} · {t("dragHint")}
          </p>
        </div>
      )}

      {match && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="match-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-plum p-6"
        >
          <Star spin className="pointer-events-none absolute -right-24 -top-24 size-96 text-grape" />
          <Star spin className="pointer-events-none absolute -bottom-20 -left-20 size-64 text-grape" />
          <div className="relative flex w-full max-w-md flex-col gap-7">
            <Plei mood="celebrate" size={150} bubbleSide="top" message={null} />
            <h2 id="match-title" className="rise-in text-6xl font-extrabold leading-[0.95]">
              {t("matchTitle")} <span className="serif-accent text-spark">{t("matchAccent")}</span>
            </h2>
            <p className="rise-in text-lg leading-relaxed" style={{ "--delay": "0.12s" } as React.CSSProperties}>
              {t("matchBody", { name: match.name })}
            </p>
            <div className="rise-in flex flex-col gap-3" style={{ "--delay": "0.24s" } as React.CSSProperties}>
              {!match.demo && (
                <Link
                  href={match.conversationId ? `/messages/${match.conversationId}` : "/messages"}
                  className="press flex min-h-13 items-center justify-center rounded-full bg-spark text-base font-semibold text-spark-foreground"
                >
                  {t("sendMessage")}
                </Link>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => setMatch(null)}
                className="press min-h-13 rounded-full border border-primary text-base hover:bg-background/20"
              >
                {t("keepExploring")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CandidateCard({
  candidate,
  tagById,
  locale,
  badge,
}: {
  candidate: Candidate
  tagById: Map<number, Tables<"tags">>
  locale: string
  badge: string
}) {
  const shared = new Set(candidate.sharedTagIds)
  const tags = [...candidate.tagIds]
    .sort((a, b) => Number(shared.has(b)) - Number(shared.has(a)))
    .map((id) => tagById.get(id))
    .filter((tag): tag is Tables<"tags"> => Boolean(tag))
    .slice(0, 6)
  const cover = publicUrl("artworks", candidate.coverPath)

  return (
    <article className="flex size-full flex-col overflow-hidden rounded-[32px] border bg-card">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-plum">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" draggable={false} className="size-full object-cover" />
        ) : (
          <GenerativeArt seed={candidate.id} />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-spark px-3 py-1.5 text-[13px] font-semibold text-spark-foreground">
          {badge}
        </span>
        {candidate.demo && <DemoBadge className="absolute right-4 top-4" />}
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            name={candidate.displayName}
            src={publicUrl("avatars", candidate.avatarPath)}
            className="size-12 border-2 border-background"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-2xl font-extrabold leading-tight">{candidate.displayName}</h3>
            <p className="truncate text-sm text-muted-foreground">
              @{candidate.username}
              {candidate.location ? ` · ${candidate.location}` : ""}
            </p>
          </div>
        </div>
        {candidate.bio && <p className="line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">{candidate.bio}</p>}
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-[13px]",
                shared.has(tag.id) ? "border border-grape bg-plum" : "border bg-raise text-muted-foreground"
              )}
            >
              {shared.has(tag.id) && <Check className="size-3.5 text-spark" aria-hidden />}
              {tagLabel(tag, locale)}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
