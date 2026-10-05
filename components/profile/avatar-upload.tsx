"use client"

import { Camera, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"

import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { createClient } from "@/lib/supabase/client"
import { publicUrl } from "@/lib/storage"
import { AVATAR_MAX_BYTES, extensionFor, IMAGE_TYPES } from "@/lib/uploads"

// Uploads straight to Storage (avatars/<uid>/...) and reports the new path.
export function AvatarUpload({
  userId,
  name,
  initialUrl,
  onUploaded,
}: {
  userId: string
  name: string
  initialUrl: string | null
  onUploaded: (path: string) => void
}) {
  const t = useTranslations("profile")
  const tv = useTranslations("validation")
  const inputId = useId()
  const [preview, setPreview] = useState(initialUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return setError(tv("fileType", { name: file.name }))
    if (file.size > AVATAR_MAX_BYTES) return setError(tv("fileTooLarge", { name: file.name }))

    setError(null)
    setBusy(true)
    const path = `${userId}/avatar-${Date.now()}.${extensionFor(file)}`
    const { error: uploadError } = await createClient()
      .storage.from("avatars")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" })
    setBusy(false)
    if (uploadError) return setError(tv("uploadFailed"))

    setPreview(publicUrl("avatars", path))
    onUploaded(path)
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <ProfileAvatar name={name} src={preview} className="size-24 text-2xl" />
        {busy && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-background/70">
            <Loader2 className="size-6 animate-spin" aria-hidden />
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <label
          htmlFor={inputId}
          className="press inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-[15px] font-medium hover:bg-raise has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
        >
          <Camera className="size-4" aria-hidden />
          {t("changeAvatar")}
          <input
            id={inputId}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            className="sr-only"
            disabled={busy}
            onChange={onChange}
          />
        </label>
        <p className="text-sm text-muted-foreground">{t("avatarHint")}</p>
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      </div>
    </div>
  )
}
