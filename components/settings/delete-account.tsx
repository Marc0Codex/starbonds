"use client"

import { Loader2, TriangleAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState, useTransition } from "react"

import { deleteAccount } from "@/app/(app)/settings/safety-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Destructive: requires typing the exact username before the button enables.
export function DeleteAccount({ username }: { username: string }) {
  const t = useTranslations("settings")
  const inputId = useId()
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const matches = value.trim().toLowerCase() === username

  return (
    <section className="flex flex-col gap-4 rounded-[24px] border border-destructive/40 p-6">
      <p className="eyebrow !text-destructive">{t("dangerTitle")}</p>
      <div className="flex gap-3">
        <TriangleAlert className="mt-1 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-bold">{t("deleteTitle")}</h2>
          <p className="text-muted-foreground">{t("deleteBody")}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          {t("deleteConfirmLabel", { username })}
        </label>
        <Input
          id={inputId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
        {error}
      </p>
      <Button
        type="button"
        variant="destructive"
        size="lg"
        disabled={!matches || pending}
        className="self-start"
        onClick={() =>
          startTransition(async () => {
            const result = await deleteAccount(value)
            if (result && !result.ok) setError(result.error === "mismatch" ? t("deleteMismatch") : t("deleteError"))
          })
        }
      >
        {pending && <Loader2 className="animate-spin" aria-hidden />}
        {t("deleteButton")}
      </Button>
    </section>
  )
}
