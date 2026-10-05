"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

export type GroupErrorKey = "groupNameInvalid" | "groupDescriptionTooLong" | "generic"
export type GroupState = { error?: GroupErrorKey } | undefined

const groupSchema = z.object({
  name: z.string().trim().min(3, { error: "groupNameInvalid" }).max(80, { error: "groupNameInvalid" }),
  description: z
    .string()
    .trim()
    .max(1000, { error: "groupDescriptionTooLong" })
    .transform((v) => (v.length ? v : null)),
})

function slugify(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base.length >= 3 ? base : "grupo"}-${suffix}`
}

export async function createGroup(_prev: GroupState, formData: FormData): Promise<GroupState> {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const parsed = groupSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
  })
  if (!parsed.success) return { error: (parsed.error.issues[0]?.message as GroupErrorKey) ?? "generic" }

  const supabase = await createClient()
  const slug = slugify(parsed.data.name)
  // The owner is added as a member by a database trigger.
  const { error } = await supabase.from("groups").insert({
    slug,
    name: parsed.data.name,
    description: parsed.data.description,
    owner_id: current.userId,
  })
  if (error) return { error: "generic" }

  revalidatePath("/community/groups")
  redirect(`/community/groups/${slug}`)
}

export async function setMembership(groupId: string, join: boolean, slug: string) {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  const supabase = await createClient()
  const { error } = join
    ? await supabase.from("group_members").insert({ group_id: groupId, profile_id: current.userId })
    : await supabase.from("group_members").delete().eq("group_id", groupId).eq("profile_id", current.userId)
  revalidatePath(`/community/groups/${slug}`)
  revalidatePath("/community/groups")
  return { ok: !error }
}
