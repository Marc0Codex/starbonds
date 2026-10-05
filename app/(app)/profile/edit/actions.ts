"use server"

import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/lib/profile"
import {
  basicsSchema,
  detailsSchema,
  firstIssue,
  type FormState,
  isUsernameTaken,
  parseTagIds,
  replaceTags,
  str,
  validateTags,
} from "@/lib/profile-mutations"
import { createClient } from "@/lib/supabase/server"
import { isOwnPath } from "@/lib/uploads"

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  const { userId, profile } = current

  const basics = basicsSchema.safeParse({
    displayName: str(formData, "displayName"),
    username: str(formData, "username"),
    bio: str(formData, "bio"),
  })
  if (!basics.success) return { error: firstIssue(basics.error) }

  const details = detailsSchema.safeParse({
    location: str(formData, "location"),
    website: str(formData, "website"),
    openToCollab: formData.get("openToCollab") === "on",
  })
  if (!details.success) return { error: firstIssue(details.error) }

  const tagIds = parseTagIds(formData)
  const tagError = await validateTags(tagIds)
  if (tagError) return { error: tagError }

  // Only accept avatars uploaded into the user's own folder.
  const avatarInput = str(formData, "avatarPath")
  const avatarPath = avatarInput && isOwnPath(avatarInput, userId) ? avatarInput : profile.avatar_path

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: basics.data.displayName,
      username: basics.data.username,
      bio: basics.data.bio,
      location: details.data.location,
      website: details.data.website,
      open_to_collab: details.data.openToCollab,
      avatar_path: avatarPath,
    })
    .eq("id", userId)
  if (error) return { error: isUsernameTaken(error) ? "usernameTaken" : "generic" }

  if (!(await replaceTags(userId, tagIds))) return { error: "generic" }

  // Clean up the previous avatar file once the new one is saved.
  const previous = profile.avatar_path
  if (previous && previous !== avatarPath && isOwnPath(previous, userId)) {
    await supabase.storage.from("avatars").remove([previous])
  }

  redirect(`/u/${basics.data.username}`)
}
