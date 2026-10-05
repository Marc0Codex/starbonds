import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { Logo } from "@/components/logo"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { getAllTags, getCurrentProfile, getProfileTagIds } from "@/lib/profile"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding")
  return { title: t("metaTitle") }
}

export default async function OnboardingPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login?next=/onboarding")
  if (current.profile.onboarded) redirect("/profile/edit")

  const [tags, selectedTagIds] = await Promise.all([getAllTags(), getProfileTagIds(current.userId)])

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 py-6 sm:px-10">
        <Logo />
      </header>
      <main className="flex flex-1 justify-center px-5 pb-16">
        <div className="w-full max-w-2xl">
          <OnboardingFlow
            tags={tags}
            initial={{
              displayName: current.profile.display_name,
              username: current.profile.username,
              bio: current.profile.bio ?? "",
              tagIds: selectedTagIds,
            }}
          />
        </div>
      </main>
    </div>
  )
}
