"use client"

import { Ban, Flag, Loader2, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useId, useState, useTransition } from "react"
import { toast } from "sonner"

import { fileReport, setBlocked } from "@/app/(app)/settings/safety-actions"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SafetyMenu({ targetId, name, initialBlocked }: { targetId: string; name: string; initialBlocked: boolean }) {
  const t = useTranslations("safety")
  const router = useRouter()
  const reasonId = useId()
  const [blocked, setBlockedState] = useState(initialBlocked)
  const [reporting, setReporting] = useState(false)
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()

  function toggleBlock() {
    const next = !blocked
    startTransition(async () => {
      const { ok } = await setBlocked(targetId, next)
      if (!ok) return void toast.error(t("error"))
      setBlockedState(next)
      toast.success(next ? t("blocked", { name }) : t("unblocked", { name }))
      router.refresh()
    })
  }

  function sendReport() {
    startTransition(async () => {
      const { ok } = await fileReport({ targetType: "profile", targetId, reason })
      if (!ok) return void toast.error(t("error"))
      toast.success(t("reportSent"))
      setReporting(false)
      setReason("")
    })
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t("menu")}
          className="press grid size-11 place-items-center rounded-full border hover:bg-raise"
        >
          <MoreHorizontal className="size-5" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5">
          <DropdownMenuItem onClick={toggleBlock} variant={blocked ? "default" : "destructive"} className="min-h-10 rounded-xl px-3">
            <Ban aria-hidden />
            {blocked ? t("unblock") : t("block")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setReporting(true)} className="min-h-10 rounded-xl px-3">
            <Flag aria-hidden />
            {t("report")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {reporting && (
        <div className="rise-in flex w-full max-w-sm flex-col gap-3 rounded-[22px] border bg-card p-4">
          <label htmlFor={reasonId} className="font-heading font-bold">
            {t("reportTitle", { name })}
          </label>
          <textarea
            id={reasonId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
            rows={3}
            autoFocus
            placeholder={t("reportPlaceholder")}
            className="resize-none rounded-2xl border bg-background px-3 py-2 outline-none focus-visible:border-ring"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setReporting(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" disabled={pending || reason.trim().length < 3} onClick={sendReport}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              {t("reportSend")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
