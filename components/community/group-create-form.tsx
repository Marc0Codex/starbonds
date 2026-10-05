"use client"

import { Loader2, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useActionState, useState } from "react"

import { createGroup, type GroupState } from "@/app/(app)/community/groups/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function GroupCreateForm() {
  const t = useTranslations("groups")
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [state, formAction, pending] = useActionState<GroupState, FormData>(createGroup, undefined)

  if (!open) {
    return (
      <Button type="button" size="lg" className="press self-start" onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        {t("create")}
      </Button>
    )
  }

  return (
    <form action={formAction} className="rise-in flex flex-col gap-5 rounded-[28px] border bg-card p-6">
      <h2 className="text-3xl font-extrabold">
        {t("createTitle")} <span className="serif-accent text-primary">{t("createAccent")}</span>
      </h2>
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="description" value={description} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="group-name">{t("name")}</Label>
        <Input id="group-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="group-description">{t("description")}</Label>
        <Textarea
          id="group-description"
          value={description}
          maxLength={1000}
          placeholder={t("descriptionPlaceholder")}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
        {state?.error ? t(`errors.${state.error}`) : null}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {t("back")}
        </Button>
        <Button type="submit" disabled={pending || name.trim().length < 3}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {t("create")}
        </Button>
      </div>
    </form>
  )
}
