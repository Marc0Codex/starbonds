"use server"

import { cookies } from "next/headers"
import { refresh } from "next/cache"

import { isLocale, LOCALE_COOKIE } from "@/i18n/config"
import { createClient, getUserId } from "@/lib/supabase/server"

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return

  ;(await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })

  const userId = await getUserId()
  if (userId) {
    const supabase = await createClient()
    await supabase.from("profiles").update({ locale }).eq("id", userId)
  }

  refresh()
}
