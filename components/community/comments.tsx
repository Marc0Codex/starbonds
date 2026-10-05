"use client"

import { Loader2, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { useId, useState, useTransition } from "react"
import { toast } from "sonner"

import { addComment, deleteComment } from "@/app/(app)/community/actions"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import type { FeedComment } from "@/lib/posts"
import { publicUrl } from "@/lib/storage"

export function Comments({
  postId,
  comments,
  now,
  signedIn,
}: {
  postId: string
  comments: FeedComment[]
  now: number
  signedIn: boolean
}) {
  const t = useTranslations("community")
  const format = useFormatter()
  const inputId = useId()
  const [body, setBody] = useState("")
  const [pending, startTransition] = useTransition()
  const [removing, setRemoving] = useState<string | null>(null)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const text = body.trim()
    if (!text) return
    startTransition(async () => {
      const result = await addComment(postId, text)
      if ("ok" in result) setBody("")
      else toast.error(t("errors.generic"))
    })
  }

  function remove(id: string) {
    setRemoving(id)
    startTransition(async () => {
      const result = await deleteComment(id, postId)
      if (!("ok" in result)) toast.error(t("errors.generic"))
      setRemoving(null)
    })
  }

  return (
    <section aria-labelledby="comments-title" className="flex flex-col gap-6">
      <h2 id="comments-title" className="text-2xl font-extrabold">
        {t("commentsTitle")}
      </h2>

      {signedIn ? (
        <form onSubmit={submit} className="flex items-end gap-2 rounded-[24px] border bg-card p-2 pl-5">
          <label htmlFor={inputId} className="sr-only">
            {t("commentLabel")}
          </label>
          <textarea
            id={inputId}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            rows={1}
            placeholder={t("commentPlaceholder")}
            className="field-sizing-content min-h-11 flex-1 resize-none bg-transparent py-2.5 outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!body.trim() || pending}
            aria-label={t("send")}
            className="press grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-spark hover:text-spark-foreground disabled:opacity-40"
          >
            {pending && !removing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          </button>
        </form>
      ) : (
        <p className="text-muted-foreground">
          <Link href={`/login?next=/posts/${postId}`} className="font-semibold text-primary hover:underline">
            {t("signInToComment")}
          </Link>
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-muted-foreground">{t("noComments")}</p>
      ) : (
        <ol className="flex flex-col gap-5">
          {comments.map((comment) => (
            <li key={comment.id} className="rise-in flex gap-3" style={{ opacity: removing === comment.id ? 0.4 : undefined }}>
              <Link href={`/u/${comment.author.username}`} className="shrink-0">
                <ProfileAvatar
                  name={comment.author.displayName}
                  src={publicUrl("avatars", comment.author.avatarPath)}
                  className="size-9 text-xs"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-sm">
                  <Link href={`/u/${comment.author.username}`} className="font-semibold hover:text-primary">
                    {comment.author.displayName}
                  </Link>{" "}
                  <time dateTime={comment.createdAt} className="text-muted-foreground">
                    · {format.relativeTime(new Date(comment.createdAt), now)}
                  </time>
                </p>
                <p className="whitespace-pre-line break-words leading-relaxed">{comment.body}</p>
              </div>
              {comment.canDelete && (
                <button
                  type="button"
                  onClick={() => remove(comment.id)}
                  disabled={pending}
                  aria-label={t("deleteComment")}
                  className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-raise hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
