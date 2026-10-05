"use client"

import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"

import { LocalTime } from "@/components/chat/local-time"
import { Star } from "@/components/brand/star"
import { DemoBadge } from "@/components/demo-badge"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import type { ChatMessage } from "@/lib/messages"
import { publicUrl } from "@/lib/storage"
import { createClient } from "@/lib/supabase/client"
import { authorizeRealtime } from "@/lib/supabase/realtime"
import { cn } from "@/lib/utils"

type UiMessage = ChatMessage & { status?: "sending" | "failed" }
type Other = { id: string; username: string; displayName: string; avatarPath: string | null }

const PAGE_SIZE = 50

export function ChatView({
  conversationId,
  meId,
  other,
  listing = null,
  initialMessages,
  demo,
}: {
  conversationId: string
  meId: string
  other: Other
  listing?: { id: string; title: string } | null
  initialMessages: ChatMessage[]
  /** Sample conversation (lib/demo.ts): local only, with canned replies. */
  demo?: { replies: string[] }
}) {
  const t = useTranslations("chat")
  const tm = useTranslations("market")
  const router = useRouter()
  const inputId = useId()
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<UiMessage[]>(initialMessages)
  const [hasOlder, setHasOlder] = useState(initialMessages.length >= PAGE_SIZE)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const [typing, setTyping] = useState(false)
  const replyIndex = useRef(0)

  // Mark as read, then refresh server data so the nav unread badge updates.
  const markRead = useCallback(() => {
    void supabase.rpc("mark_conversation_read", { p_conversation: conversationId }).then(() => router.refresh())
  }, [supabase, conversationId, router])

  // Live messages for this conversation (Realtime respects RLS).
  useEffect(() => {
    if (demo) return
    let active = true
    markRead()
    const channel = supabase.channel(`conversation:${conversationId}`)
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const row = payload.new as { id: number; sender_id: string; body: string; created_at: string }
        setMessages((prev) =>
          prev.some((m) => m.id === row.id)
            ? prev
            : [...prev, { id: row.id, senderId: row.sender_id, body: row.body, createdAt: row.created_at }]
        )
        if (row.sender_id !== meId) markRead()
      }
    )
    void authorizeRealtime(supabase).then(() => {
      if (!active) return
      channel.subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.error("[chat] realtime", status, err)
      })
    })
    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [supabase, conversationId, meId, markRead, demo])

  // Keep the view pinned to the newest message unless the user scrolled up.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  async function loadOlder() {
    const oldest = messages.find((m) => m.id > 0)
    if (!oldest) return
    setLoadingOlder(true)
    const el = scrollRef.current
    const prevHeight = el?.scrollHeight ?? 0
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .lt("created_at", oldest.createdAt)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE)
    const older = (data ?? [])
      .map((m) => ({ id: m.id, senderId: m.sender_id, body: m.body, createdAt: m.created_at }))
      .reverse()
    stickToBottom.current = false
    setMessages((prev) => [...older, ...prev])
    setHasOlder(older.length === PAGE_SIZE)
    setLoadingOlder(false)
    // Keep the reading position after prepending.
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - prevHeight
    })
  }

  async function deliver(tempId: number, body: string) {
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: meId, body })
      .select("id, sender_id, body, created_at")
      .single()
    setMessages((prev) => {
      if (error || !data) return prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
      const withoutTemp = prev.filter((m) => m.id !== tempId)
      return withoutTemp.some((m) => m.id === data.id)
        ? withoutTemp
        : [...withoutTemp, { id: data.id, senderId: data.sender_id, body: data.body, createdAt: data.created_at }]
    })
  }

  function send() {
    const body = draft.trim()
    if (!body) return
    const tempId = -Date.now()
    stickToBottom.current = true
    setDraft("")

    // Demo chat: keep the message locally and answer with a canned reply.
    if (demo) {
      setMessages((prev) => [...prev, { id: tempId, senderId: meId, body, createdAt: new Date().toISOString() }])
      if (!demo.replies.length) return
      setTimeout(() => setTyping(true), 500)
      setTimeout(() => {
        const reply = demo.replies[replyIndex.current % demo.replies.length]
        replyIndex.current += 1
        setTyping(false)
        setMessages((prev) => [...prev, { id: -Date.now(), senderId: other.id, body: reply, createdAt: new Date().toISOString() }])
      }, 1900)
      return
    }

    setMessages((prev) => [...prev, { id: tempId, senderId: meId, body, createdAt: new Date().toISOString(), status: "sending" }])
    void deliver(tempId, body)
  }

  function retry(message: UiMessage) {
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: "sending" } : m)))
    void deliver(message.id, message.body)
  }

  return (
    <div className="flex h-[calc(100dvh-13.5rem)] flex-col md:h-[calc(100dvh-6rem)]">
      <header className="flex items-center gap-3 border-b pb-4">
        <Link
          href="/messages"
          aria-label={t("back")}
          className="press grid size-11 shrink-0 place-items-center rounded-full hover:bg-raise"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        {demo ? (
          <div className="flex min-w-0 items-center gap-3">
            <ProfileAvatar name={other.displayName} src={null} className="size-11" />
            <span className="min-w-0">
              <span className="block truncate font-heading text-lg font-bold">{other.displayName}</span>
              <span className="block truncate text-sm text-muted-foreground">@{other.username}</span>
            </span>
            <DemoBadge className="shrink-0" />
          </div>
        ) : (
          <Link href={`/u/${other.username}`} className="group flex min-w-0 items-center gap-3" title={t("viewProfile")}>
            <ProfileAvatar name={other.displayName} src={publicUrl("avatars", other.avatarPath)} className="size-11" />
            <span className="min-w-0">
              <span className="block truncate font-heading text-lg font-bold group-hover:text-primary">{other.displayName}</span>
              <span className="block truncate text-sm text-muted-foreground">@{other.username}</span>
            </span>
          </Link>
        )}
        {listing && (
          <Link
            href={`/listing/${listing.id}`}
            className="ml-auto hidden max-w-[45%] items-center gap-2 truncate rounded-full border border-grape bg-plum px-4 py-2 text-sm hover:border-primary sm:flex"
          >
            <span className="serif-accent text-primary">{tm("about")}</span>
            <span className="truncate">{listing.title}</span>
          </Link>
        )}
      </header>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto py-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {hasOlder && (
          <button
            type="button"
            onClick={loadOlder}
            disabled={loadingOlder}
            className="press mb-4 flex min-h-10 items-center gap-2 self-center rounded-full border px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            {loadingOlder && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t("loadOlder")}
          </button>
        )}

        {messages.length === 0 && (
          <div className="m-auto flex max-w-sm flex-col items-center gap-4 text-center">
            <Star spin className="size-14 text-primary" />
            <h2 className="text-3xl font-extrabold leading-none">
              {t("startTitle")} <span className="serif-accent text-primary">{t("startAccent")}</span>
            </h2>
            <p className="text-muted-foreground">{t("startBody")}</p>
          </div>
        )}

        {messages.map((message, i) => {
          const mine = message.senderId === meId
          const nextMsg = messages[i + 1]
          const lastOfGroup = !nextMsg || nextMsg.senderId !== message.senderId
          return (
            <div
              key={message.id}
              className={cn("flex flex-col", mine ? "items-end" : "items-start", lastOfGroup && "mb-3")}
            >
              <p
                className={cn(
                  "rise-in max-w-[80%] whitespace-pre-line break-words rounded-[22px] px-4 py-2.5 text-[15px] leading-relaxed",
                  mine ? "bg-primary text-primary-foreground" : "border bg-card",
                  mine && lastOfGroup && "rounded-br-md",
                  !mine && lastOfGroup && "rounded-bl-md",
                  message.status === "sending" && "opacity-60"
                )}
              >
                {message.body}
              </p>
              {message.status === "failed" ? (
                <button
                  type="button"
                  onClick={() => retry(message)}
                  className="mt-1 min-h-8 text-xs text-destructive underline-offset-2 hover:underline"
                >
                  {t("failed")}
                </button>
              ) : (
                lastOfGroup && (
                  <span className="mt-1 px-1 text-xs text-muted-foreground">
                    {message.status === "sending" ? t("sending") : <LocalTime iso={message.createdAt} withDate />}
                  </span>
                )
              )}
            </div>
          )
        })}

        {typing && (
          <div className="rise-in flex items-center gap-1.5 self-start rounded-[22px] rounded-bl-md border bg-card px-4 py-3.5" aria-label="…">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="pulse-dot size-2 rounded-full bg-primary"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex items-end gap-2 rounded-[26px] border bg-card p-2 pl-5"
      >
        <label htmlFor={inputId} className="sr-only">
          {t("inputLabel")}
        </label>
        <textarea
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send()
            }
          }}
          rows={1}
          maxLength={4000}
          placeholder={t("placeholder")}
          aria-describedby={`${inputId}-hint`}
          className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2.5 outline-none placeholder:text-muted-foreground"
        />
        <span id={`${inputId}-hint`} className="sr-only">
          {t("sendHint")}
        </span>
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label={t("send")}
          className="press grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-spark hover:text-spark-foreground disabled:opacity-40"
        >
          <Send className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  )
}
