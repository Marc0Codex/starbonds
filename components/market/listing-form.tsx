"use client"

import { Brush, HandHelping, ImagePlus, Loader2, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useId, useRef, useState, useTransition } from "react"

import { saveListing } from "@/app/(app)/marketplace/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CURRENCIES } from "@/lib/format"
import { publicUrl } from "@/lib/storage"
import { createClient } from "@/lib/supabase/client"
import { tagLabel } from "@/lib/tags"
import { ARTWORK_MAX_BYTES, extensionFor, IMAGE_TYPES, LISTING_MAX_IMAGES } from "@/lib/uploads"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

type Kind = "artwork" | "service"
type Item = { key: string; path: string; url: string } | { key: string; file: File; url: string }
type PortfolioArtwork = { id: string; title: string; images: string[] }

export type ListingInitial = {
  id: string
  kind: Kind
  title: string
  description: string
  price: string
  currency: string
  mediumTagId: number | null
  artworkId: string | null
  images: string[]
}

const fieldClass =
  "h-12 w-full rounded-2xl border border-input bg-card px-4 text-base outline-none transition-colors focus-visible:border-ring focus-visible:bg-raise focus-visible:ring-3 focus-visible:ring-ring/30"

export function ListingForm({
  userId,
  mediums,
  artworks,
  initial,
}: {
  userId: string
  mediums: Tables<"tags">[]
  artworks: PortfolioArtwork[]
  initial?: ListingInitial
}) {
  const t = useTranslations("market")
  const tv = useTranslations("validation")
  const locale = useLocale()
  const fileId = useId()
  const [kind, setKind] = useState<Kind>(initial?.kind ?? "artwork")
  const [title, setTitle] = useState(initial?.title ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [price, setPrice] = useState(initial?.price ?? "")
  const [currency, setCurrency] = useState(initial?.currency ?? "USD")
  const [mediumTagId, setMediumTagId] = useState<number | null>(initial?.mediumTagId ?? null)
  const [artworkId, setArtworkId] = useState<string | null>(initial?.artworkId ?? null)
  const [items, setItems] = useState<Item[]>(
    () => initial?.images.map((path) => ({ key: path, path, url: publicUrl("artworks", path) ?? "" })) ?? []
  )
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [pending, startTransition] = useTransition()
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
  }, [items])
  useEffect(
    () => () =>
      itemsRef.current.forEach((item) => {
        if ("file" in item) URL.revokeObjectURL(item.url)
      }),
    []
  )

  const busy = Boolean(progress) || pending

  function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    setError(null)
    const room = LISTING_MAX_IMAGES - items.length
    const accepted: Item[] = []
    for (const file of files) {
      if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
        setError(tv("fileType", { name: file.name }))
        continue
      }
      if (file.size > ARTWORK_MAX_BYTES) {
        setError(tv("fileTooLarge", { name: file.name }))
        continue
      }
      if (accepted.length >= room) {
        setError(t("errors.tooManyImages"))
        break
      }
      accepted.push({ key: crypto.randomUUID(), file, url: URL.createObjectURL(file) })
    }
    setItems((prev) => [...prev, ...accepted])
  }

  function remove(key: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.key === key)
      if (item && "file" in item) URL.revokeObjectURL(item.url)
      return prev.filter((i) => i.key !== key)
    })
  }

  function pickArtwork(id: string) {
    const artwork = artworks.find((a) => a.id === id)
    setArtworkId(artwork?.id ?? null)
    if (!artwork) return
    setKind("artwork")
    if (!title.trim()) setTitle(artwork.title)
    const fromArtwork = artwork.images
      .slice(0, LISTING_MAX_IMAGES)
      .map((path) => ({ key: path, path, url: publicUrl("artworks", path) ?? "" }))
    setItems((prev) => {
      prev.forEach((item) => {
        if ("file" in item) URL.revokeObjectURL(item.url)
      })
      return fromArtwork
    })
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (!items.length) return setError(t("errors.imagesRequired"))

    const supabase = createClient()
    const folder = `${userId}/listings/${crypto.randomUUID()}`
    const uploaded: string[] = []
    const paths: string[] = []
    const newOnes = items.filter((i) => "file" in i).length
    let n = 0
    for (const [index, item] of items.entries()) {
      if ("path" in item) {
        paths.push(item.path)
        continue
      }
      n += 1
      setProgress({ current: n, total: newOnes })
      const path = `${folder}/${index}.${extensionFor(item.file)}`
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(path, item.file, { contentType: item.file.type, cacheControl: "31536000" })
      if (uploadError) {
        if (uploaded.length) await supabase.storage.from("artworks").remove(uploaded)
        setProgress(null)
        return setError(tv("uploadFailed"))
      }
      uploaded.push(path)
      paths.push(path)
    }
    setProgress(null)

    startTransition(async () => {
      const result = await saveListing({
        id: initial?.id ?? null,
        kind,
        title,
        description,
        price,
        currency: currency as (typeof CURRENCIES)[number],
        mediumTagId,
        artworkId,
        images: paths,
      })
      if (result?.error) {
        if (uploaded.length) await supabase.storage.from("artworks").remove(uploaded)
        setError(t(`errors.${result.error}`))
      }
    })
  }

  const kinds = [
    { value: "artwork" as const, label: t("kindArtwork"), hint: t("kindArtworkHint"), icon: Brush },
    { value: "service" as const, label: t("kindService"), hint: t("kindServiceHint"), icon: HandHelping },
  ]

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10" noValidate>
      <fieldset className="rise-in flex flex-col gap-3" disabled={busy}>
        <legend className="mb-3 font-heading text-lg font-bold">{t("kind")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {kinds.map(({ value, label, hint, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
              className={cn(
                "press flex items-center gap-4 rounded-[22px] border p-5 text-left transition-colors duration-200",
                kind === value ? "border-grape bg-plum" : "bg-card hover:border-primary"
              )}
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-2xl",
                  kind === value ? "bg-spark text-spark-foreground" : "bg-raise text-primary"
                )}
                aria-hidden
              >
                <Icon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-heading text-lg font-bold">{label}</span>
                <span className="text-sm text-muted-foreground">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {artworks.length > 0 && kind === "artwork" && (
        <div className="rise-in flex flex-col gap-2">
          <Label htmlFor="listing-artwork">{t("fromPortfolio")}</Label>
          <select
            id="listing-artwork"
            value={artworkId ?? ""}
            onChange={(e) => pickArtwork(e.target.value)}
            disabled={busy}
            className={fieldClass}
          >
            <option value="">{t("none")}</option>
            {artworks.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground">{t("fromPortfolioHint")}</p>
        </div>
      )}

      <section className="rise-in flex flex-col gap-4" style={{ "--delay": "0.05s" } as React.CSSProperties}>
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-bold">{t("images")}</h2>
          <p className="text-sm text-muted-foreground">{t("imagesHint")}</p>
        </div>
        <ul className="grid grid-cols-3 gap-3">
          {items.map((item, i) => (
            <li key={item.key} className="pop relative aspect-square overflow-hidden rounded-[20px] border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-spark px-2.5 py-1 text-xs font-semibold text-spark-foreground">
                  {t("cover")}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(item.key)}
                disabled={busy}
                aria-label={t("removeImage", { n: i + 1 })}
                className="press absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-background/90 hover:bg-destructive hover:text-background"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
          {items.length < LISTING_MAX_IMAGES && (
            <li>
              <label
                htmlFor={fileId}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed text-muted-foreground transition-colors duration-300 hover:border-primary hover:bg-card hover:text-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  busy && "pointer-events-none opacity-50"
                )}
              >
                <ImagePlus className="size-7" aria-hidden />
                <span className="px-2 text-center text-sm font-medium">{t("addImages")}</span>
                <input
                  id={fileId}
                  type="file"
                  multiple
                  accept={IMAGE_TYPES.join(",")}
                  className="sr-only"
                  onChange={onFiles}
                  disabled={busy}
                />
              </label>
            </li>
          )}
        </ul>
      </section>

      <section className="rise-in grid gap-5 sm:grid-cols-2" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="listing-title">{t("title")}</Label>
          <Input id="listing-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="listing-price">{t("price")}</Label>
          <Input
            id="listing-price"
            inputMode="decimal"
            value={price}
            placeholder="0"
            onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="listing-currency">{t("currency")}</Label>
          <select id="listing-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={fieldClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="listing-medium">{t("medium")}</Label>
          <select
            id="listing-medium"
            value={mediumTagId ?? ""}
            onChange={(e) => setMediumTagId(Number(e.target.value) || null)}
            className={fieldClass}
          >
            <option value="">{t("noMedium")}</option>
            {mediums.map((m) => (
              <option key={m.id} value={m.id}>
                {tagLabel(m, locale)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="listing-description">{t("description")}</Label>
          <Textarea
            id="listing-description"
            value={description}
            maxLength={4000}
            placeholder={t("descriptionPlaceholder")}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
        <Button type="submit" size="lg" disabled={busy} className="ml-auto">
          {busy && <Loader2 className="animate-spin" aria-hidden />}
          {progress ? t("uploading", progress) : initial ? t("save") : t("publish")}
        </Button>
      </div>
    </form>
  )
}
