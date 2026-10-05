import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { ProfileForm } from "@/components/profile/profile-form"
import { getAllTags, getCurrentProfile, getProfileTagIds } from "@/lib/profile"
import { publicUrl } from "@/lib/storage"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile")
  return { title: t("edit") }
}

export default async function EditProfilePage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  const { profile, userId } = current
  const [tags, tagIds, t] = await Promise.all([getAllTags(), getProfileTagIds(userId), getTranslations("profile")])

  return (
    <div className="flex flex-col gap-10">
      <h1 className="rise-in text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-none">
        {t("editTitle")} <span className="serif-accent text-primary">{t("editAccent")}</span>
      </h1>
      <ProfileForm
        userId={userId}
        tags={tags}
        initial={{
          displayName: profile.display_name,
          username: profile.username,
          bio: profile.bio ?? "",
          location: profile.location ?? "",
          website: profile.website ?? "",
          openToCollab: profile.open_to_collab,
          avatarUrl: publicUrl("avatars", profile.avatar_path),
          tagIds,
        }}
      />
    </div>
  )
}
