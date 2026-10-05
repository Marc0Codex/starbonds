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

// `email` / `displayName` are echoed back so the form keeps them after an error.
export type AuthState =
  | { error?: AuthErrorKey; checkEmail?: string; email?: string; displayName?: string }
  | undefined

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

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email")
  const parsed = credentials.safeParse({ email, password: text(formData, "password") })
  if (!parsed.success) return { error: firstIssue(parsed.error), email }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "emailNotConfirmed", email }
    if (error.code === "invalid_credentials") return { error: "invalidCredentials", email }
    return { error: "generic", email }
  }

  redirect(safeNextPath(formData.get("next")))
}

const signupSchema = credentials.extend({
  displayName: z.string().trim().min(1, { error: "displayNameRequired" }).max(60),
})

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email")
  const displayName = text(formData, "displayName")
  const parsed = signupSchema.safeParse({ email, password: text(formData, "password"), displayName })
  if (!parsed.success) return { error: firstIssue(parsed.error), email, displayName }

  const supabase = await createClient()
  const locale = formData.get("locale") === "en" ? "en" : "es"
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/onboarding`,
      data: { display_name: parsed.data.displayName, locale },
    },
  })
  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { error: "userExists", email, displayName }
    }
    return { error: "generic", email, displayName }
  }

  // Email confirmation enabled -> no session yet.
  if (!data.session) return { checkEmail: parsed.data.email }
  redirect("/onboarding")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
