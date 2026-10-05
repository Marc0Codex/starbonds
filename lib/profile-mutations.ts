import "server-only"

import { z } from "zod"

import { getAllTags } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import { MAX_TAGS } from "@/lib/tags"

export type ValidationKey =
  | "usernameTaken"
  | "usernameInvalid"
  | "displayNameRequired"
  | "bioTooLong"
  | "websiteInvalid"
  | "mediumRequired"
  | "goalRequired"
  | "tooManyTags"
  | "generic"

export type FormState = { error?: ValidationKey; ok?: boolean } | undefined

const optionalText = (max: number, error: ValidationKey) =>
  z
    .string()
    .trim()
    .max(max, { error })
    .transform((v) => (v.length ? v : null))

export const basicsSchema = z.object({
  displayName: z.string().trim().min(1, { error: "displayNameRequired" }).max(60, { error: "displayNameRequired" }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, { error: "usernameInvalid" }),
  bio: optionalText(500, "bioTooLong"),
})

export const detailsSchema = z.object({
  location: optionalText(80, "generic"),
  website: z
    .string()
    .trim()
    .max(200, { error: "websiteInvalid" })
    .refine((v) => v === "" || /^https?:\/\/[^\s]+\.[^\s]+$/.test(v), { error: "websiteInvalid" })
    .transform((v) => (v.length ? v : null)),
  openToCollab: z.boolean(),
})

export function str(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export function firstIssue(error: z.ZodError): ValidationKey {
  return (error.issues[0]?.message as ValidationKey) ?? "generic"
}

export function parseTagIds(formData: FormData) {
  return [...new Set(formData.getAll("tags").map(Number).filter(Number.isInteger))]
}

// Requires at least one medium and one goal; returns an error key or null.
export async function validateTags(tagIds: number[]): Promise<ValidationKey | null> {
  if (tagIds.length > MAX_TAGS) return "tooManyTags"
  const tags = await getAllTags()
  const chosen = tags.filter((tag) => tagIds.includes(tag.id))
  if (chosen.length !== tagIds.length) return "generic"
  if (!chosen.some((tag) => tag.kind === "medium")) return "mediumRequired"
  if (!chosen.some((tag) => tag.kind === "goal")) return "goalRequired"
  return null
}

export async function replaceTags(userId: string, tagIds: number[]) {
  const supabase = await createClient()
  const { error: deleteError } = await supabase.from("profile_tags").delete().eq("profile_id", userId)
  if (deleteError) return false
  if (!tagIds.length) return true
  const { error } = await supabase
    .from("profile_tags")
    .insert(tagIds.map((tag_id) => ({ profile_id: userId, tag_id })))
  return !error
}

// Postgres unique_violation on profiles.username
export function isUsernameTaken(error: { code?: string } | null) {
  return error?.code === "23505"
}
