"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useId, useRef, useState, useTransition } from "react"

import { createArtwork } from "@/app/(app)/profile/artworks/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { ARTWORK_MAX_BYTES, ARTWORK_MAX_IMAGES, extensionFor, IMAGE_TYPES } from "@/lib/uploads"
import { cn } from "@/lib/utils"

type Picked = { id: string; file: File; url: string }

export function ArtworkForm({ userId }: { userId: string }) {
  const t = useTranslations("artworks")
  const tv = useTranslations("validation")
  const inputId = useId()
  const [picked, setPicked] = useState<Picked[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [pending, startTransition] = useTransition()
  const pickedRef = useRef(picked)

  useEffect(() => {
    pickedRef.current = picked
  }, [picked])

  // Release preview object URLs when leaving the page.
  useEffect(() => () => pickedRef.current.forEach((p) => URL.revokeObjectURL(p.url)), [])

  function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    setError(null)
    const accepted: Picked[] = []
    for (const file of files) {
      if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
        setError(tv("fileType", { name: file.name }))
        continue
      }
      if (file.size > ARTWORK_MAX_BYTES) {
        setError(tv("fileTooLarge", { name: file.name }))
        continue
      }
      accepted.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) })
    }
    setPicked((prev) => {
      const next = [...prev, ...accepted]
      if (next.length > ARTWORK_MAX_IMAGES) {
        setError(tv("tooManyImages"))
        next.slice(ARTWORK_MAX_IMAGES).forEach((p) => URL.revokeObjectURL(p.url))
        return next.slice(0, ARTWORK_MAX_IMAGES)
      }
      return next
    })
  }

  function remove(id: string) {
    setPicked((prev) => {
      const item = prev.find((p) => p.id === id)
      if (item) URL.revokeObjectURL(item.url)
      return prev.filter((p) => p.id !== id)
    })
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!String(form.get("title") ?? "").trim()) return setError(tv("titleRequired"))
    if (!picked.length) return setError(tv("imagesRequired"))
    setError(null)

    const supabase = createClient()
    const folder = `${userId}/${crypto.randomUUID()}`
    const uploaded: string[] = []
    for (const [i, item] of picked.entries()) {
      setProgress({ current: i + 1, total: picked.length })
      const path = `${folder}/${i}.${extensionFor(item.file)}`
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(path, item.file, { contentType: item.file.type, cacheControl: "31536000" })
      if (uploadError) {
        if (uploaded.length) await supabase.storage.from("artworks").remove(uploaded)
        setProgress(null)
        return setError(tv("uploadFailed"))
      }
      uploaded.push(path)
    }
    setProgress(null)

    uploaded.forEach((path) => form.append("images", path))
    startTransition(async () => {
      const result = await createArtwork(form)
      if (result?.error) {
        await supabase.storage.from("artworks").remove(uploaded)
        setError(tv(result.error))
      }
    })
  }

  const busy = Boolean(progress) || pending

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10" noValidate>
      <section className="rise-in flex flex-col gap-4" style={{ "--delay": "0.05s" } as React.CSSProperties}>
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-bold">{t("images")}</h2>
          <p className="text-sm text-muted-foreground">{t("imagesHint")}</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {picked.map((item, i) => (
            <li key={item.id} className="pop relative aspect-square overflow-hidden rounded-[20px] border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-spark px-2.5 py-1 text-xs font-semibold text-spark-foreground">
                  {t("cover")}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(item.id)}
                disabled={busy}
                aria-label={t("remove", { name: item.file.name })}
                className="press absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-background/90 hover:bg-destructive hover:text-background"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
          {picked.length < ARTWORK_MAX_IMAGES && (
            <li>
              <label
                htmlFor={inputId}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed text-muted-foreground transition-colors duration-300 hover:border-primary hover:bg-card hover:text-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  busy && "pointer-events-none opacity-50"
                )}
              >
                <ImagePlus className="size-7" aria-hidden />
                <span className="text-sm font-medium">{t("addImages")}</span>
                <input
                  id={inputId}
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

      <section className="rise-in grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="aw-title">{t("title")}</Label>
          <Input id="aw-title" name="title" maxLength={120} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="aw-year">{t("year")}</Label>
          <Input id="aw-year" name="year" inputMode="numeric" pattern="\d{4}" maxLength={4} placeholder={String(new Date().getFullYear())} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="aw-description">{t("description")}</Label>
          <Textarea id="aw-description" name="description" maxLength={2000} placeholder={t("descriptionPlaceholder")} />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
        <Button type="submit" size="lg" disabled={busy} className="ml-auto">
          {busy && <Loader2 className="animate-spin" aria-hidden />}
          {progress ? t("uploading", progress) : t("publish")}
        </Button>
      </div>
    </form>
  )
}
