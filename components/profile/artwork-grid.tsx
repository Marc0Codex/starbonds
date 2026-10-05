import Link from "next/link"

import { publicUrl } from "@/lib/storage"
import type { Tables } from "@/types/database"

// Masonry portfolio: images keep their natural aspect ratio.
export function ArtworkGrid({ artworks }: { artworks: Tables<"artworks">[] }) {
  return (
    <ul className="columns-2 gap-4 md:columns-3 [&>li]:mb-4">
      {artworks.map((artwork, i) => (
        <li
          key={artwork.id}
          className="rise-in break-inside-avoid"
          style={{ "--delay": `${Math.min(i, 8) * 60}ms` } as React.CSSProperties}
        >
          <Link
            href={`/artworks/${artwork.id}`}
            className="lift group relative block overflow-hidden rounded-[20px] border bg-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrl("artworks", artwork.images[0]) ?? ""}
              alt={artwork.title}
              loading="lazy"
              decoding="async"
              className="block w-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]"
            />
            <span className="absolute inset-x-2 bottom-2 translate-y-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              {artwork.title}
              {artwork.images.length > 1 && (
                <span className="ml-2 text-muted-foreground">+{artwork.images.length - 1}</span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
