import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { MatchDeck } from "@/components/match/match-deck"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { withDemoCandidates } from "@/lib/demo"
import { getCandidates, getMatches } from "@/lib/match"
import { getAllTags, getCurrentProfile, getProfileTagIds } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav")
  return { title: t("match") }
}

export default async function MatchPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const [realCandidates, matches, tags, myTagIds, locale, t, tNav] = await Promise.all([
    getCandidates(20),
    getMatches(current.userId),
    getAllTags(),
    getProfileTagIds(current.userId),
    getLocale(),
    getTranslations("match"),
    getTranslations("nav"),
  ])
  // Sample artists appended after real ones (see lib/demo.ts).
  const candidates = withDemoCandidates(realCandidates, tags, myTagIds, locale)

  return (
    <div className="flex flex-col gap-8">
      <header className="rise-in flex flex-col gap-2">
        <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">{tNav("match")}</h1>
        <p className="text-[17px] text-muted-foreground">
          {t("subtitle")} <span className="serif-accent text-lg text-primary">{t("subtitleAccent")}</span>
        </p>
      </header>

      {matches.length > 0 && (
        <section aria-labelledby="matches-title" className="flex flex-col gap-3">
          <h2 id="matches-title" className="eyebrow">
            {t("yourMatches")}
          </h2>
          <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
            {matches.map((m) => (
              <li key={m.id} className="shrink-0">
                <Link
                  href={m.conversationId ? `/messages/${m.conversationId}` : `/u/${m.other.username}`}
                  className="group flex w-20 flex-col items-center gap-2 text-center"
                >
                  <span className="rounded-full p-0.5 ring-2 ring-spark transition-transform duration-300 group-hover:scale-105">
                    <ProfileAvatar
                      name={m.other.displayName}
                      src={publicUrl("avatars", m.other.avatarPath)}
                      className="size-16 border-2 border-background"
                    />
                  </span>
                  <span className="w-full truncate text-xs">{m.other.displayName}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <MatchDeck candidates={candidates} tags={tags} />
    </div>
  )
}
