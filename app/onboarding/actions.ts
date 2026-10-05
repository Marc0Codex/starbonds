"use server"

import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/lib/profile"
import {
  basicsSchema,
  firstIssue,
  type FormState,
  isUsernameTaken,
  parseTagIds,
  replaceTags,
  str,
  validateTags,
} from "@/lib/profile-mutations"
import { createClient } from "@/lib/supabase/server"

export async function completeOnboarding(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const basics = basicsSchema.safeParse({
    displayName: str(formData, "displayName"),
    username: str(formData, "username"),
    bio: str(formData, "bio"),
  })
  if (!basics.success) return { error: firstIssue(basics.error) }

  const tagIds = parseTagIds(formData)
  const tagError = await validateTags(tagIds)
  if (tagError) return { error: tagError }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: basics.data.displayName,
      username: basics.data.username,
      bio: basics.data.bio,
    })
    .eq("id", current.userId)
  if (error) return { error: isUsernameTaken(error) ? "usernameTaken" : "generic" }

  if (!(await replaceTags(current.userId, tagIds))) return { error: "generic" }

  const { error: doneError } = await supabase.from("profiles").update({ onboarded: true }).eq("id", current.userId)
  if (doneError) return { error: "generic" }

  redirect(`/u/${basics.data.username}`)
}
