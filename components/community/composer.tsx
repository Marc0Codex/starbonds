"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useId, useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { createPost } from "@/app/(app)/community/actions"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ARTWORK_MAX_BYTES, extensionFor, IMAGE_TYPES, POST_MAX_IMAGES } from "@/lib/uploads"
import { cn } from "@/lib/utils"

type PostType = "general" | "collaboration" | "showcase"
type Picked = { id: string; file: File; url: string }

const TYPES: { value: PostType; key: "typeGeneral" | "typeCollaboration" | "typeShowcase" }[] = [
  { value: "general", key: "typeGeneral" },
  { value: "collaboration", key: "typeCollaboration" },
  { value: "showcase", key: "typeShowcase" },
]

export function Composer({
  userId,
  user,
  groupId = null,
}: {
  userId: string
  user: { displayName: string; avatarUrl: string | null }
  groupId?: string | null
}) {
  const t = useTranslations("community")
  const tv = useTranslations("validation")
  const router = useRouter()
  const inputId = useId()
  const textId = useId()
  const [body, setBody] = useState("")
  const [postType, setPostType] = useState<PostType>("general")
  const [picked, setPicked] = useState<Picked[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()
  const pickedRef = useRef(picked)

  useEffect(() => {
    pickedRef.current = picked
  }, [picked])
  useEffect(() => () => pickedRef.current.forEach((p) => URL.revokeObjectURL(p.url)), [])

  const busy = uploading || pending
  const canPublish = (body.trim().length > 0 || picked.length > 0) && !busy

  function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    setError(null)
    const room = POST_MAX_IMAGES - picked.length
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
      if (accepted.length >= room) {
        setError(t("errors.tooManyImages"))
        break
      }
      accepted.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) })
    }
    setPicked((prev) => [...prev, ...accepted])
  }

  function remove(id: string) {
    setPicked((prev) => {
      const item = prev.find((p) => p.id === id)
      if (item) URL.revokeObjectURL(item.url)
      return prev.filter((p) => p.id !== id)
    })
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canPublish) return
    setError(null)

    const supabase = createClient()
    const folder = `${userId}/posts/${crypto.randomUUID()}`
    const media: string[] = []
    setUploading(true)
    for (const [i, item] of picked.entries()) {
      const path = `${folder}/${i}.${extensionFor(item.file)}`
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(path, item.file, { contentType: item.file.type, cacheControl: "31536000" })
      if (uploadError) {
        if (media.length) await supabase.storage.from("artworks").remove(media)
        setUploading(false)
        return setError(tv("uploadFailed"))
      }
      media.push(path)
    }
    setUploading(false)

    startTransition(async () => {
      const result = await createPost({ body, postType, media, groupId })
      if (result.error) {
        if (media.length) await supabase.storage.from("artworks").remove(media)
        setError(t(`errors.${result.error}`))
        return
      }
      picked.forEach((p) => URL.revokeObjectURL(p.url))
      setPicked([])
      setBody("")
      setPostType("general")
      toast.success(t("published"))
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label={t("composerLabel")}
      className="flex flex-col gap-4 rounded-[28px] border bg-card p-4 sm:p-5"
    >
      <div className="flex gap-3">
        <ProfileAvatar name={user.displayName} src={user.avatarUrl} className="size-11" />
        <label htmlFor={textId} className="sr-only">
          {t("composerLabel")}
        </label>
        <textarea
          id={textId}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={2}
          placeholder={groupId ? t("composerPlaceholderGroup") : t("composerPlaceholder")}
          className="field-sizing-content min-h-12 w-full resize-none bg-transparent py-2.5 text-[17px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
      </div>

      {picked.length > 0 && (
        <ul className="grid grid-cols-4 gap-2">
          {picked.map((item, i) => (
            <li key={item.id} className="pop relative aspect-square overflow-hidden rounded-2xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => remove(item.id)}
                disabled={busy}
                aria-label={t("removeImage", { n: i + 1 })}
                className="absolute right-1 top-1 grid size-8 place-items-center rounded-full bg-background/90 hover:bg-destructive hover:text-background"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <fieldset className="flex flex-wrap gap-1.5" disabled={busy}>
          <legend className="sr-only">{t("postType")}</legend>
          {TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              aria-pressed={postType === type.value}
              onClick={() => setPostType(type.value)}
              className={cn(
                "min-h-10 rounded-full border px-3.5 text-sm transition-colors duration-200",
                postType === type.value
                  ? "border-grape bg-plum text-foreground"
                  : "text-muted-foreground hover:bg-raise hover:text-foreground"
              )}
            >
              {t(type.key)}
            </button>
          ))}
        </fieldset>

        <div className="ml-auto flex items-center gap-2">
          {picked.length < POST_MAX_IMAGES && (
            <label
              htmlFor={inputId}
              className={cn(
                "press grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-raise hover:text-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                busy && "pointer-events-none opacity-50"
              )}
              title={t("addImages")}
            >
              <ImagePlus className="size-5" aria-hidden />
              <span className="sr-only">{t("addImages")}</span>
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
          )}
          <Button type="submit" disabled={!canPublish}>
            {busy && <Loader2 className="animate-spin" aria-hidden />}
            {busy ? t("publishing") : t("publish")}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  )
}
