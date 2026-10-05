"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useActionState, useState } from "react"

import { updateProfile } from "@/app/(app)/profile/edit/actions"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { TagPicker } from "@/components/profile/tag-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FormState } from "@/lib/profile-mutations"
import { groupTags, MAX_TAGS, TAG_KINDS } from "@/lib/tags"
import type { Tables } from "@/types/database"

type Initial = {
  displayName: string
  username: string
  bio: string
  location: string
  website: string
  openToCollab: boolean
  avatarUrl: string | null
  tagIds: number[]
}

// Visible controls are controlled and unnamed; hidden inputs carry the values so a
// failed submit (React resets forms after actions) never wipes the user's edits.
export function ProfileForm({ userId, tags, initial }: { userId: string; tags: Tables<"tags">[]; initial: Initial }) {
  const t = useTranslations("profile")
  const to = useTranslations("onboarding")
  const tv = useTranslations("validation")
  const tc = useTranslations("common")
  const tt = useTranslations("tags")
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfile, undefined)

  const [displayName, setDisplayName] = useState(initial.displayName)
  const [username, setUsername] = useState(initial.username)
  const [bio, setBio] = useState(initial.bio)
  const [location, setLocation] = useState(initial.location)
  const [website, setWebsite] = useState(initial.website)
  const [openToCollab, setOpenToCollab] = useState(initial.openToCollab)
  const [avatarPath, setAvatarPath] = useState("")
  const [selected, setSelected] = useState(() => new Set(initial.tagIds))

  const grouped = groupTags(tags)

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_TAGS) next.add(id)
      return next
    })
  }

  return (
    <form action={formAction} className="flex flex-col gap-12">
      <input type="hidden" name="displayName" value={displayName} />
      <input type="hidden" name="username" value={username} />
      <input type="hidden" name="bio" value={bio} />
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="website" value={website} />
      <input type="hidden" name="avatarPath" value={avatarPath} />
      {openToCollab && <input type="hidden" name="openToCollab" value="on" />}
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="tags" value={id} />
      ))}

      <section className="rise-in flex flex-col gap-6" style={{ "--delay": "0.05s" } as React.CSSProperties}>
        <h2 className="eyebrow">{t("avatar")}</h2>
        <AvatarUpload userId={userId} name={displayName} initialUrl={initial.avatarUrl} onUploaded={setAvatarPath} />
      </section>

      <section className="rise-in grid gap-5 sm:grid-cols-2" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-name">{to("displayName")}</Label>
          <Input id="pf-name" value={displayName} maxLength={60} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-username">{to("username")}</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
              @
            </span>
            <Input
              id="pf-username"
              value={username}
              maxLength={30}
              autoCapitalize="none"
              spellCheck={false}
              className="pl-8"
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="pf-bio">{to("bio")}</Label>
          <Textarea
            id="pf-bio"
            value={bio}
            maxLength={500}
            placeholder={to("bioPlaceholder")}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-location">{t("location")}</Label>
          <Input
            id="pf-location"
            value={location}
            maxLength={80}
            placeholder={t("locationPlaceholder")}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-website">{t("website")}</Label>
          <Input
            id="pf-website"
            type="url"
            inputMode="url"
            value={website}
            maxLength={200}
            placeholder="https://"
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <label
          htmlFor="pf-collab"
          className="flex items-center justify-between gap-6 rounded-2xl border bg-card p-5 sm:col-span-2"
        >
          <span className="flex flex-col gap-1">
            <span className="font-medium">{t("openToCollabLabel")}</span>
            <span className="text-sm text-muted-foreground">{t("openToCollabHint")}</span>
          </span>
          <input
            id="pf-collab"
            type="checkbox"
            role="switch"
            checked={openToCollab}
            onChange={(e) => setOpenToCollab(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-7 w-12 shrink-0 rounded-full bg-raise transition-colors duration-300 peer-checked:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-foreground after:transition-transform after:duration-300 after:ease-[var(--ease-spring)] peer-checked:after:translate-x-5 peer-checked:after:bg-primary-foreground"
          />
        </label>
      </section>

      <section className="rise-in flex flex-col gap-8" style={{ "--delay": "0.15s" } as React.CSSProperties}>
        <h2 className="text-3xl font-extrabold">{t("tagsTitle")}</h2>
        {TAG_KINDS.map((kind) => (
          <TagPicker key={kind} tags={grouped[kind]} selected={selected} onToggle={toggle} legend={tt(kind)} />
        ))}
      </section>

      <div className="sticky bottom-24 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border bg-card/95 p-3 pl-5 backdrop-blur-md md:bottom-6">
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state?.error ? tv(state.error) : null}
        </p>
        <Button type="submit" size="lg" disabled={pending} className="ml-auto">
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {pending ? tc("saving") : tc("save")}
        </Button>
      </div>
    </form>
  )
}
