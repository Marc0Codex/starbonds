"use client"

import { Check, Loader2, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { setMembership } from "@/app/(app)/community/groups/actions"
import { Button } from "@/components/ui/button"

export function MembershipButton({ groupId, slug, isMember }: { groupId: string; slug: string; isMember: boolean }) {
  const t = useTranslations("groups")
  const [hover, setHover] = useState(false)
  const [pending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const { ok } = await setMembership(groupId, !isMember, slug)
      if (!ok) toast.error(t("errors.generic"))
    })
  }

  if (isMember) {
    return (
      <Button
        type="button"
        variant={hover ? "destructive" : "outline"}
        onClick={toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        disabled={pending}
        className="press min-w-40"
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
        {hover ? t("leave") : t("joined")}
      </Button>
    )
  }

  return (
    <Button type="button" onClick={toggle} disabled={pending} className="press min-w-40">
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
      {t("join")}
    </Button>
  )
}
