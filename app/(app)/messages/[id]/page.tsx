import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getLocale, getNow } from "next-intl/server"

import { ChatView } from "@/components/chat/chat-view"
import { DEMO_CONVERSATION_PREFIX, getDemoConversation } from "@/lib/demo"
import { getConversation, getMessages } from "@/lib/messages"
import { getCurrentProfile } from "@/lib/profile"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function generateMetadata({ params }: PageProps<"/messages/[id]">): Promise<Metadata> {
  const { id } = await params
  const current = await getCurrentProfile()
  if (!current) return {}
  if (id.startsWith(DEMO_CONVERSATION_PREFIX)) {
    const demo = getDemoConversation(id, current.userId, await getLocale(), (await getNow()).getTime())
    return demo ? { title: demo.other.displayName } : {}
  }
  if (!UUID_RE.test(id)) return {}
  const conversation = await getConversation(id, current.userId)
  return conversation ? { title: conversation.other.displayName } : {}
}

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  // Sample conversation (lib/demo.ts): nothing is read from or written to the database.
  if (id.startsWith(DEMO_CONVERSATION_PREFIX)) {
    const demo = getDemoConversation(id, current.userId, await getLocale(), (await getNow()).getTime())
    if (!demo) notFound()
    return (
      <ChatView
        key={id}
        conversationId={id}
        meId={current.userId}
        other={demo.other}
        initialMessages={demo.messages}
        demo={{ replies: demo.replies }}
      />
    )
  }

  if (!UUID_RE.test(id)) notFound()

  // RLS only returns conversations the user belongs to.
  const conversation = await getConversation(id, current.userId)
  if (!conversation) notFound()
  const messages = await getMessages(id)

  return (
    <ChatView
      key={id}
      conversationId={id}
      meId={current.userId}
      other={conversation.other}
      listing={conversation.listing}
      initialMessages={messages}
    />
  )
}
