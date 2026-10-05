"use client"

import { Loader2, MailCheck } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { useActionState } from "react"

import { login, signup, type AuthState } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Mode = "login" | "signup"

export function AuthForm({ mode, next, callbackError }: { mode: Mode; next?: string; callbackError?: boolean }) {
  const t = useTranslations("auth")
  const locale = useLocale()
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? login : signup,
    undefined
  )

  if (state?.checkEmail) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <MailCheck className="mx-auto size-10 text-primary" aria-hidden />
          <CardTitle className="font-heading text-2xl">{t("checkEmailTitle")}</CardTitle>
          <CardDescription>{t("checkEmailBody", { email: state.checkEmail })}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const errorKey = state?.error ?? (callbackError ? "callback" : undefined)
  const isLogin = mode === "login"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{isLogin ? t("loginTitle") : t("signupTitle")}</CardTitle>
        <CardDescription>{isLogin ? t("loginSubtitle") : t("signupSubtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="next" value={next ?? ""} />
          <input type="hidden" name="locale" value={locale} />

          {!isLogin && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">{t("displayName")}</Label>
              <Input id="displayName" name="displayName" autoComplete="nickname" required maxLength={60} className="h-11" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required className="h-11" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              aria-describedby={isLogin ? undefined : "password-hint"}
              className="h-11"
            />
            {!isLogin && (
              <p id="password-hint" className="text-xs text-muted-foreground">
                {t("passwordHint")}
              </p>
            )}
          </div>

          <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
            {errorKey ? t(`errors.${errorKey}`) : null}
          </p>

          <Button type="submit" disabled={pending} className="h-11 w-full text-sm">
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {isLogin ? t("loginButton") : t("signupButton")}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
        {isLogin ? t("noAccount") : t("haveAccount")}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isLogin ? t("goToSignup") : t("goToLogin")}
        </Link>
      </CardFooter>
    </Card>
  )
}
