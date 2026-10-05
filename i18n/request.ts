import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"

import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config"

// Locale comes from the NEXT_LOCALE cookie (set in Settings),
// falling back to the browser's Accept-Language header.
async function resolveLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value
  if (isLocale(fromCookie)) return fromCookie

  const acceptLanguage = (await headers()).get("accept-language") ?? ""
  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase())
    .find(isLocale)
  return preferred ?? defaultLocale
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale()
  return {
    locale,
    // Only relative times are shown, so a fixed zone keeps server/client output identical.
    timeZone: "UTC",
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
