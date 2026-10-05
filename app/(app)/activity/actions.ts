"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

export async function markAllNotificationsRead() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  const supabase = await createClient()
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", current.userId)
    .is("read_at", null)
  revalidatePath("/", "layout")
}
