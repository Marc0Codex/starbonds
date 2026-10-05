import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AuthForm } from "@/components/auth/auth-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return { title: t("loginButton") }
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams
  return (
    <AuthForm
      mode="login"
      next={typeof next === "string" ? next : undefined}
      callbackError={error === "callback"}
    />
  )
}
