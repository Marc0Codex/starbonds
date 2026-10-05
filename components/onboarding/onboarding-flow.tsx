"use client"

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useActionState, useState } from "react"

import { completeOnboarding } from "@/app/onboarding/actions"
import { TagPicker } from "@/components/profile/tag-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FormState, ValidationKey } from "@/lib/profile-mutations"
import { groupTags, MAX_TAGS, TAG_KINDS } from "@/lib/tags"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

type Initial = { displayName: string; username: string; bio: string; tagIds: number[] }

const USERNAME_RE = /^[a-z0-9_]{3,30}$/
const BASICS_ERRORS: ValidationKey[] = ["usernameTaken", "usernameInvalid", "displayNameRequired", "bioTooLong"]
const STEPS = ["basics", ...TAG_KINDS] as const

export function OnboardingFlow({ tags, initial }: { tags: Tables<"tags">[]; initial: Initial }) {
  const t = useTranslations("onboarding")
  const tv = useTranslations("validation")
  const tc = useTranslations("common")
  const tt = useTranslations("tags")

  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [username, setUsername] = useState(initial.username)
  const [bio, setBio] = useState(initial.bio)
  const [selected, setSelected] = useState(() => new Set(initial.tagIds))

  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await completeOnboarding(prev, formData)
    if (result?.error && BASICS_ERRORS.includes(result.error)) setStep(0)
    return result
  }, undefined)

  const grouped = groupTags(tags)
  const count = (kind: (typeof TAG_KINDS)[number]) => grouped[kind].filter((tag) => selected.has(tag.id)).length

  const canContinue = [
    displayName.trim().length > 0 && USERNAME_RE.test(username),
    count("medium") > 0,
    true,
    count("goal") > 0,
  ][step]

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_TAGS) next.add(id)
      return next
    })
  }

  const kind = step > 0 ? TAG_KINDS[step - 1] : null
  const titles = [
    [t("step1Title"), t("step1Accent"), t("step1Body")],
    [t("step2Title"), t("step2Accent"), t("step2Body")],
    [t("step3Title"), t("step3Accent"), t("step3Body")],
    [t("step4Title"), t("step4Accent"), t("step4Body")],
  ][step]
  const isLast = step === STEPS.length - 1

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <input type="hidden" name="displayName" value={displayName} />
      <input type="hidden" name="username" value={username} />
      <input type="hidden" name="bio" value={bio} />
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="tags" value={id} />
      ))}

      <div className="flex flex-col gap-3">
        <p className="eyebrow">{t("stepOf", { current: step + 1, total: STEPS.length })}</p>
        <div className="grid grid-cols-4 gap-2" aria-hidden>
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={cn("h-1.5 rounded-full transition-colors duration-500", i <= step ? "bg-primary" : "bg-raise")}
            />
          ))}
        </div>
      </div>

      <div key={step} className="rise-in flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-[clamp(2.5rem,7vw,4rem)] font-extrabold leading-[0.95]">
            {titles[0]} <span className="serif-accent text-primary">{titles[1]}</span>
          </h1>
          <p className="text-[17px] text-muted-foreground">{titles[2]}</p>
        </div>

        {step === 0 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-display-name">{t("displayName")}</Label>
              <Input
                id="ob-display-name"
                value={displayName}
                maxLength={60}
                autoComplete="nickname"
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-username">{t("username")}</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
                  @
                </span>
                <Input
                  id="ob-username"
                  value={username}
                  maxLength={30}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-describedby="ob-username-hint"
                  aria-invalid={username.length > 0 && !USERNAME_RE.test(username)}
                  className="pl-8"
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                />
              </div>
              <p id="ob-username-hint" className="text-sm text-muted-foreground">
                {USERNAME_RE.test(username) ? t("usernameHint", { username }) : tv("usernameInvalid")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-bio">{t("bio")}</Label>
              <Textarea
                id="ob-bio"
                value={bio}
                maxLength={500}
                placeholder={t("bioPlaceholder")}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        ) : (
          kind && (
            <TagPicker
              tags={grouped[kind]}
              selected={selected}
              onToggle={toggle}
              legend={tt(kind)}
            />
          )
        )}
      </div>

      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
        {state?.error ? tv(state.error) : null}
      </p>

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft aria-hidden />
            {tc("back")}
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button type="submit" size="lg" disabled={!canContinue || pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {t("finish")}
          </Button>
        ) : (
          <Button type="button" size="lg" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
            {tc("next")}
            <ArrowRight aria-hidden />
          </Button>
        )}
      </div>
    </form>
  )
}
