import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/lib/profile"

export default async function MyProfilePage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  redirect(`/u/${current.profile.username}`)
}
