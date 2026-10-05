import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { cache } from "react"

import { DeleteArtworkButton } from "@/components/artworks/delete-artwork-button"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { getCurrentProfile } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"
import { createClient } from "@/lib/supabase/server"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const getArtwork = cache(async (id: string) => {
  if (!UUID_RE.test(id)) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("artworks")
    .select("*, owner:profiles!artworks_owner_id_fkey(id, username, display_name, avatar_path)")
    .eq("id", id)
    .maybeSingle()
  return data
})

export async function generateMetadata({ params }: PageProps<"/artworks/[id]">): Promise<Metadata> {
  const { id } = await params
  const artwork = await getArtwork(id)
  if (!artwork) return {}
  return {
    title: `${artwork.title} — ${artwork.owner?.display_name ?? ""}`,
    description: artwork.description ?? undefined,
    openGraph: { images: [publicUrl("artworks", artwork.images[0]) ?? ""] },
  }
}

export default async function ArtworkPage({ params }: PageProps<"/artworks/[id]">) {
  const { id } = await params
  const [artwork, current, t] = await Promise.all([getArtwork(id), getCurrentProfile(), getTranslations("artworks")])
  if (!artwork || !artwork.owner) notFound()

  const owner = artwork.owner
  const isOwn = current?.userId === owner.id

  return (
    <article className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        {artwork.images.map((path, i) => (
          <figure
            key={path}
            className="rise-in m-0 overflow-hidden rounded-[24px] border bg-card"
            style={{ "--delay": `${Math.min(i, 4) * 80}ms` } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrl("artworks", path) ?? ""}
              alt={t("image", { n: i + 1, title: artwork.title })}
              loading={i === 0 ? "eager" : "lazy"}
              className="block w-full"
            />
          </figure>
        ))}
      </div>

      <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-col gap-3">
          {artwork.year && <p className="eyebrow">{artwork.year}</p>}
          <h1 className="text-[clamp(2.5rem,5vw,3.75rem)] font-extrabold leading-[0.95]">
            <span className="reveal">
              <span className="break-words">{artwork.title}</span>
            </span>
          </h1>
        </div>

        <Link
          href={`/u/${owner.username}`}
          className="group flex items-center gap-3 self-start rounded-full border bg-card py-1.5 pl-1.5 pr-5 transition-colors hover:border-primary"
        >
          <ProfileAvatar name={owner.display_name} src={publicUrl("avatars", owner.avatar_path)} />
          <span className="flex flex-col leading-tight">
            <span className="serif-accent text-sm text-muted-foreground">{t("by")}</span>
            <span className="font-semibold">{owner.display_name}</span>
          </span>
        </Link>

        {artwork.description && (
          <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{artwork.description}</p>
        )}

        {isOwn && (
          <div className="border-t pt-6">
            <DeleteArtworkButton artworkId={artwork.id} />
          </div>
        )}
      </aside>
    </article>
  )
}
