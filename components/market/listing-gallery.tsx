"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { GenerativeArt } from "@/components/brand/generative-art"
import { publicUrl } from "@/lib/storage"
import { cn } from "@/lib/utils"

export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const t = useTranslations("market")
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border">
        <GenerativeArt seed={title} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <figure className="m-0 overflow-hidden rounded-[28px] border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={images[active]}
          src={publicUrl("artworks", images[active]) ?? ""}
          alt={t("image", { n: active + 1, title })}
          className="fade-in block max-h-[78dvh] w-full object-contain"
          style={{ "--delay": "0s" } as React.CSSProperties}
        />
      </figure>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((path, i) => (
            <li key={path} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={t("image", { n: i + 1, title })}
                aria-pressed={active === i}
                className={cn(
                  "press block size-20 overflow-hidden rounded-2xl border-2 transition-colors",
                  active === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={publicUrl("artworks", path) ?? ""} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
