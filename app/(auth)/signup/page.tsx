import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AuthForm } from "@/components/auth/auth-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return { title: t("signupButton") }
}

export default function SignupPage() {
  return <AuthForm mode="signup" />
}
