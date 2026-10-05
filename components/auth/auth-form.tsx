"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { useActionState } from "react"

import { login, signup, type AuthState } from "@/app/(auth)/actions"
import { Star } from "@/components/brand/star"
import { Button } from "@/components/ui/button"
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
      <div className="rise-in flex flex-col items-start gap-5">
        <Star className="pop size-16 text-spark" />
        <h1 className="text-5xl font-extrabold leading-none">{t("checkEmailTitle")}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{t("checkEmailBody", { email: state.checkEmail })}</p>
      </div>
    )
  }

  const errorKey = state?.error ?? (callbackError ? "callback" : undefined)
  const isLogin = mode === "login"

  return (
    <div className="flex flex-col gap-8">
      <div className="rise-in flex flex-col gap-3">
        <h1 className="text-[clamp(2.75rem,8vw,3.75rem)] font-extrabold leading-[0.95]">
          {isLogin ? t("loginTitle") : t("signupTitle")}{" "}
          <span className="serif-accent text-primary">{isLogin ? t("loginAccent") : t("signupAccent")}</span>
        </h1>
        <p className="text-[17px] text-muted-foreground">{isLogin ? t("loginSubtitle") : t("signupSubtitle")}</p>
      </div>

      <form
        action={formAction}
        className="rise-in flex flex-col gap-5"
        style={{ "--delay": "0.1s" } as React.CSSProperties}
        noValidate
      >
        <input type="hidden" name="next" value={next ?? ""} />
        <input type="hidden" name="locale" value={locale} />

        {!isLogin && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">{t("displayName")}</Label>
            <Input
              id="displayName"
              name="displayName"
              autoComplete="nickname"
              required
              maxLength={60}
              defaultValue={state?.displayName}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            defaultValue={state?.email}
          />
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
          />
          {!isLogin && (
            <p id="password-hint" className="text-sm text-muted-foreground">
              {t("passwordHint")}
            </p>
          )}
        </div>

        <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
          {errorKey ? t(`errors.${errorKey}`) : null}
        </p>

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {isLogin ? t("loginButton") : t("signupButton")}
          {!pending && <ArrowRight aria-hidden />}
        </Button>
      </form>

      <p className="text-[15px] text-muted-foreground">
        {isLogin ? t("noAccount") : t("haveAccount")}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-semibold text-primary underline-offset-4 hover:text-foreground hover:underline"
        >
          {isLogin ? t("goToSignup") : t("goToLogin")}
        </Link>
      </p>
    </div>
  )
}
