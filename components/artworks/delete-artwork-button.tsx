"use client"

import { Loader2, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteArtwork } from "@/app/(app)/profile/artworks/actions"
import { Button } from "@/components/ui/button"

// Two-step delete (no browser confirm dialog): first click arms, second deletes.
export function DeleteArtworkButton({ artworkId }: { artworkId: string }) {
  const t = useTranslations("artworks")
  const tv = useTranslations("validation")
  const [armed, setArmed] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant={armed ? "destructive" : "ghost"}
      disabled={pending}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (!armed) return setArmed(true)
        startTransition(async () => {
          const result = await deleteArtwork(artworkId)
          if (result?.error) toast.error(tv("generic"))
        })
      }}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
      {armed ? t("confirmDelete") : t("delete")}
    </Button>
  )
}
