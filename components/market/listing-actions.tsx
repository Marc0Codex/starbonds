"use client"

import { CheckCircle2, Eye, EyeOff, Loader2, MessageCircle, Pencil, RotateCcw, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { contactSeller, deleteListing, setListingStatus } from "@/app/(app)/marketplace/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ContactSellerButton({ listingId, sellerName }: { listingId: string; sellerName: string }) {
  const t = useTranslations("market")
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="lg"
        disabled={pending}
        className="press w-full"
        onClick={() =>
          startTransition(async () => {
            const result = await contactSeller(listingId)
            if (result && !result.ok) toast.error(t("errors.generic"))
          })
        }
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <MessageCircle aria-hidden />}
        {t("contact")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">{t("contactHint", { name: sellerName })}</p>
    </div>
  )
}

export function OwnerListingActions({
  listingId,
  status,
}: {
  listingId: string
  status: "active" | "sold" | "hidden"
}) {
  const t = useTranslations("market")
  const [pending, startTransition] = useTransition()
  const [armed, setArmed] = useState(false)

  function changeStatus(next: "active" | "sold" | "hidden") {
    startTransition(async () => {
      const { ok } = await setListingStatus(listingId, next)
      if (ok) toast.success(t("statusChanged"))
      else toast.error(t("errors.generic"))
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border bg-card p-5">
      <p className="eyebrow">{t("yourListing")}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {status === "sold" ? (
          <Button type="button" variant="outline" disabled={pending} onClick={() => changeStatus("active")}>
            <RotateCcw aria-hidden />
            {t("markActive")}
          </Button>
        ) : (
          <Button type="button" disabled={pending} onClick={() => changeStatus("sold")}>
            <CheckCircle2 aria-hidden />
            {t("markSold")}
          </Button>
        )}
        {status === "hidden" ? (
          <Button type="button" variant="outline" disabled={pending} onClick={() => changeStatus("active")}>
            <Eye aria-hidden />
            {t("unhide")}
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled={pending} onClick={() => changeStatus("hidden")}>
            <EyeOff aria-hidden />
            {t("hide")}
          </Button>
        )}
        <Link href={`/marketplace/${listingId}/edit`} className={cn(buttonVariants({ variant: "outline" }))}>
          <Pencil aria-hidden />
          {t("edit")}
        </Link>
        <Button
          type="button"
          variant={armed ? "destructive" : "ghost"}
          disabled={pending}
          onBlur={() => setArmed(false)}
          onClick={() => {
            if (!armed) return setArmed(true)
            startTransition(async () => {
              const result = await deleteListing(listingId)
              if (result && !result.ok) toast.error(t("errors.generic"))
            })
          }}
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
          {armed ? t("confirmDelete") : t("delete")}
        </Button>
      </div>
    </div>
  )
}
