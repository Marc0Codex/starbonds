"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useTransition } from "react"
import { toast } from "sonner"

import { setBlocked } from "@/app/(app)/settings/safety-actions"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { Button } from "@/components/ui/button"
import { publicUrl } from "@/lib/storage"

type Blocked = { id: string; username: string; displayName: string; avatarPath: string | null }

export function BlockedList({ users }: { users: Blocked[] }) {
  const t = useTranslations("safety")
  const ts = useTranslations("settings")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-bold">{ts("blockedTitle")}</h2>
      {users.length === 0 ? (
        <p className="text-muted-foreground">{ts("blockedEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <li key={user.id} className="flex items-center gap-3 rounded-2xl border bg-background p-2 pl-3">
              <ProfileAvatar name={user.displayName} src={publicUrl("avatars", user.avatarPath)} className="size-10" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{user.displayName}</span>
                <span className="block truncate text-sm text-muted-foreground">@{user.username}</span>
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const { ok } = await setBlocked(user.id, false)
                    if (!ok) return void toast.error(t("error"))
                    toast.success(t("unblocked", { name: user.displayName }))
                    router.refresh()
                  })
                }
              >
                {t("unblock")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
