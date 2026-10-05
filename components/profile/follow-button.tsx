"use client"

import { Check, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"

import { setFollow } from "@/app/(app)/community/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FollowButton({ targetId, initialFollowing }: { targetId: string; initialFollowing: boolean }) {
  const t = useTranslations("community")
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [optimistic, setOptimistic] = useOptimistic(following)
  const [, startTransition] = useTransition()

  function toggle() {
    const next = !optimistic
    startTransition(async () => {
      setOptimistic(next)
      const { ok } = await setFollow(targetId, next)
      if (!ok) return void toast.error(t("errors.generic"))
      setFollowing(next)
      router.refresh()
    })
  }

  return (
    <Button
      type="button"
      onClick={toggle}
      aria-pressed={optimistic}
      variant={optimistic ? "outline" : "default"}
      className={cn("press min-w-36")}
    >
      {optimistic ? <Check key="on" className="pop" aria-hidden /> : <Plus key="off" aria-hidden />}
      {optimistic ? t("followingButton") : t("follow")}
    </Button>
  )
}
