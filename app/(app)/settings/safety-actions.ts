"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

async function requireUser() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  return current
}

export async function setBlocked(targetId: string, blocked: boolean) {
  const { userId } = await requireUser()
  if (targetId === userId) return { ok: false }
  const supabase = await createClient()
  const { error } = blocked
    ? await supabase.from("blocks").upsert({ blocker_id: userId, blocked_id: targetId }, { ignoreDuplicates: true })
    : await supabase.from("blocks").delete().eq("blocker_id", userId).eq("blocked_id", targetId)
  revalidatePath("/", "layout")
  return { ok: !error }
}

const reportSchema = z.object({
  targetType: z.enum(["profile", "post", "comment", "listing", "message"]),
  targetId: z.string().min(1).max(100),
  reason: z.string().trim().min(3).max(1000),
})

export async function fileReport(input: z.input<typeof reportSchema>) {
  const { userId } = await requireUser()
  const parsed = reportSchema.safeParse(input)
  if (!parsed.success) return { ok: false }
  const supabase = await createClient()
  const { error } = await supabase.from("reports").insert({
    reporter_id: userId,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
  })
  return { ok: !error }
}

// Collects every file under "<uid>/" in a bucket (folders are listed level by level).
async function listOwnFiles(bucket: string, prefix: string, depth = 0): Promise<string[]> {
  if (depth > 4) return []
  const supabase = await createClient()
  const { data } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 })
  const files: string[] = []
  for (const entry of data ?? []) {
    const path = `${prefix}/${entry.name}`
    // Folders have no id in Storage listings.
    if (entry.id) files.push(path)
    else files.push(...(await listOwnFiles(bucket, path, depth + 1)))
  }
  return files
}

export async function deleteAccount(confirmUsername: string) {
  const { userId, profile } = await requireUser()
  if (confirmUsername.trim().toLowerCase() !== profile.username) return { ok: false, error: "mismatch" as const }

  const supabase = await createClient()
  // Remove the user's uploads first (best effort); database rows cascade from auth.users.
  for (const bucket of ["avatars", "artworks"]) {
    const files = await listOwnFiles(bucket, userId)
    for (let i = 0; i < files.length; i += 100) {
      await supabase.storage.from(bucket).remove(files.slice(i, i + 100))
    }
  }

  const { error } = await supabase.rpc("delete_account")
  if (error) return { ok: false, error: "generic" as const }
  await supabase.auth.signOut()
  redirect("/")
}
