"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { safeNextPath } from "@/lib/safe-redirect"
import { createClient } from "@/lib/supabase/server"

export type AuthErrorKey =
  | "invalidEmail"
  | "passwordTooShort"
  | "displayNameRequired"
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "userExists"
  | "generic"

export type AuthState = { error?: AuthErrorKey; checkEmail?: string } | undefined

const credentials = z.object({
  email: z.email({ error: "invalidEmail" }),
  password: z.string().min(8, { error: "passwordTooShort" }),
})

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  const h = await headers()
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`
}

function firstIssue(error: z.ZodError): AuthErrorKey {
  return (error.issues[0]?.message as AuthErrorKey) ?? "generic"
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "emailNotConfirmed" }
    if (error.code === "invalid_credentials") return { error: "invalidCredentials" }
    return { error: "generic" }
  }

  redirect(safeNextPath(formData.get("next")))
}

const signupSchema = credentials.extend({
  displayName: z.string().trim().min(1, { error: "displayNameRequired" }).max(60),
})

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  })
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const supabase = await createClient()
  const locale = formData.get("locale") === "en" ? "en" : "es"
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/community`,
      data: { display_name: parsed.data.displayName, locale },
    },
  })
  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") return { error: "userExists" }
    return { error: "generic" }
  }

  // Email confirmation enabled -> no session yet.
  if (!data.session) return { checkEmail: parsed.data.email }
  redirect("/community")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
