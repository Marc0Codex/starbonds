/**
 * DEMO CONTENT — permanent sample artists (Match), posts (Community) and
 * conversations (Messages).
 *
 * Lives only in code (nothing in the database): swipes, likes and chat messages on
 * demo items are local, so everything reappears on every refresh.
 *
 * To turn it off: set NEXT_PUBLIC_DEMO_MODE=off.
 * To remove it for good: delete this file and every import of "@/lib/demo"
 * (match page, community page, messages pages), then the `demo` branches in
 * components/match/match-deck.tsx, components/community/post-card.tsx and
 * components/chat/chat-view.tsx (search for "demo"), plus components/demo-badge.tsx.
 */
import type { Candidate } from "@/lib/match"
import type { ChatMessage, ConversationSummary } from "@/lib/messages"
import type { FeedPost } from "@/lib/posts"
import type { Tables } from "@/types/database"

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "off"

type Localized = { es: string; en: string }

type DemoArtist = {
  id: string
  username: string
  displayName: string
  location: string
  bio: Localized
  tags: string[]
  likesYou: boolean
}

const ARTISTS: DemoArtist[] = [
  {
    id: "demo-luna",
    username: "luna_demo",
    displayName: "Luna Ríos",
    location: "CDMX",
    bio: {
      es: "Pinto paisajes que no existen. Busco músicos para una expo audiovisual.",
      en: "I paint landscapes that don't exist. Looking for musicians for an audiovisual show.",
    },
    tags: ["painting", "abstract", "fantasy", "collaborate", "exhibit"],
    likesYou: true,
  },
  {
    id: "demo-aiko",
    username: "aiko_demo",
    displayName: "Aiko Tanaka",
    location: "Lima",
    bio: {
      es: "Ilustradora y autora de cómics. Quiero armar un fanzine colectivo.",
      en: "Illustrator and comic author. I want to put together a collective zine.",
    },
    tags: ["illustration", "comics", "anime-manga", "collaborate", "community"],
    likesYou: false,
  },
  {
    id: "demo-tomas",
    username: "tomas_demo",
    displayName: "Tomás Vega",
    location: "Bogotá",
    bio: {
      es: "Ceramista. Piezas utilitarias, formas simples, esmaltes de autor.",
      en: "Ceramicist. Functional pieces, simple shapes, handmade glazes.",
    },
    tags: ["ceramics", "minimalism", "sell", "commissions"],
    likesYou: false,
  },
  {
    id: "demo-mateo",
    username: "mateo_demo",
    displayName: "Mateo Cruz",
    location: "San José",
    bio: {
      es: "Fotografía urbana y portadas para bandas independientes.",
      en: "Street photography and covers for independent bands.",
    },
    tags: ["photography", "street-art", "music", "realism", "collaborate"],
    likesYou: true,
  },
  {
    id: "demo-sofia",
    username: "sofia_demo",
    displayName: "Sofía Marín",
    location: "Santiago",
    bio: {
      es: "Textiles y arte popular. Doy talleres de bordado los sábados.",
      en: "Textiles and folk art. I teach embroidery workshops on Saturdays.",
    },
    tags: ["textile", "folk-art", "teach", "community"],
    likesYou: false,
  },
]

type DemoPost = {
  id: string
  author: string
  postType: FeedPost["postType"]
  body: Localized
  hoursAgo: number
  likes: number
  comments: number
  art: boolean
}

const POSTS: DemoPost[] = [
  {
    id: "demo-post-1",
    author: "demo-aiko",
    postType: "collaboration",
    body: {
      es: "Busco ilustrador/a para un fanzine de cerámica y cómic. ¿Quién se suma?",
      en: "Looking for an illustrator for a ceramics-and-comics zine. Who's in?",
    },
    hoursAgo: 2,
    likes: 14,
    comments: 5,
    art: false,
  },
  {
    id: "demo-post-2",
    author: "demo-luna",
    postType: "showcase",
    body: {
      es: "Terminé «Órbita lenta», óleo sobre lino. Tres meses de capas y paciencia.",
      en: "Finished “Slow Orbit”, oil on linen. Three months of layers and patience.",
    },
    hoursAgo: 5,
    likes: 42,
    comments: 9,
    art: true,
  },
  {
    id: "demo-post-3",
    author: "demo-sofia",
    postType: "general",
    body: {
      es: "Este sábado hay taller abierto de bordado. Traigan hilo y ganas.",
      en: "Open embroidery workshop this Saturday. Bring thread and good vibes.",
    },
    hoursAgo: 9,
    likes: 8,
    comments: 2,
    art: false,
  },
  {
    id: "demo-post-4",
    author: "demo-mateo",
    postType: "showcase",
    body: {
      es: "Portada nueva para una banda local. Fotografía nocturna, sin retoque.",
      en: "New cover for a local band. Night photography, no retouching.",
    },
    hoursAgo: 20,
    likes: 23,
    comments: 4,
    art: true,
  },
]

const pick = (text: Localized, locale: string) => (locale === "en" ? text.en : text.es)

// Real candidates first, then the demo artists.
export function withDemoCandidates(
  candidates: Candidate[],
  tags: Tables<"tags">[],
  myTagIds: number[],
  locale: string
): Candidate[] {
  if (!DEMO_MODE) return candidates
  const idBySlug = new Map(tags.map((tag) => [tag.slug, tag.id]))
  const mine = new Set(myTagIds)
  const demo = ARTISTS.map((artist) => {
    const tagIds = artist.tags.map((slug) => idBySlug.get(slug)).filter((id): id is number => id !== undefined)
    return {
      id: artist.id,
      username: artist.username,
      displayName: artist.displayName,
      avatarPath: null,
      bio: pick(artist.bio, locale),
      location: artist.location,
      tagIds,
      sharedTagIds: tagIds.filter((id) => mine.has(id)),
      coverPath: null,
      demo: { likesYou: artist.likesYou },
    }
  }).sort((a, b) => b.sharedTagIds.length - a.sharedTagIds.length)
  return [...candidates, ...demo]
}

// Demo posts are appended to the first page of Discover.
export function withDemoPosts(posts: FeedPost[], locale: string, now: number): FeedPost[] {
  if (!DEMO_MODE) return posts
  const byId = new Map(ARTISTS.map((a) => [a.id, a]))
  const demo: FeedPost[] = POSTS.map((post) => {
    const author = byId.get(post.author)!
    return {
      id: post.id,
      body: pick(post.body, locale),
      media: [],
      postType: post.postType,
      createdAt: new Date(now - post.hoursAgo * 3_600_000).toISOString(),
      likesCount: post.likes,
      commentsCount: post.comments,
      liked: false,
      isOwn: false,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarPath: null,
        newVoice: true,
      },
      group: null,
      demo: { artSeed: post.art ? post.id : null },
    }
  })
  return [...posts, ...demo]
}

// ---------- Messages ----------

type DemoConversation = {
  id: string
  artist: string
  messages: { mine: boolean; body: Localized; minutesAgo: number }[]
  replies: Localized[]
}

const CONVERSATIONS: DemoConversation[] = [
  {
    id: "demo-chat-luna",
    artist: "demo-luna",
    messages: [
      { mine: false, minutesAgo: 95, body: { es: "¡Hola! Vi que hicimos match 🌙", en: "Hi! I saw we matched 🌙" } },
      {
        mine: false,
        minutesAgo: 94,
        body: {
          es: "Estoy armando una expo audiovisual y me encantaría que tu música acompañe mis pinturas.",
          en: "I'm putting together an audiovisual show and I'd love your music to go with my paintings.",
        },
      },
      { mine: true, minutesAgo: 60, body: { es: "¡Me encanta la idea! ¿Para cuándo sería?", en: "Love the idea! When would it be?" } },
      {
        mine: false,
        minutesAgo: 12,
        body: {
          es: "Pensaba en noviembre. ¿Hacemos una llamada esta semana para planearlo?",
          en: "I was thinking November. Want to hop on a call this week to plan it?",
        },
      },
    ],
    replies: [
      { es: "¡Perfecto! Te mando unas referencias por aquí ✨", en: "Perfect! I'll send you some references here ✨" },
      { es: "Me encanta, esto va a quedar increíble.", en: "Love it, this is going to look amazing." },
      { es: "Anotado. ¡Hablamos pronto!", en: "Noted. Talk soon!" },
    ],
  },
  {
    id: "demo-chat-mateo",
    artist: "demo-mateo",
    messages: [
      {
        mine: false,
        minutesAgo: 60 * 26,
        body: {
          es: "Oye, ¿te interesaría hacer la portada del próximo disco de mi banda? Yo pongo la foto.",
          en: "Hey, would you like to design the cover for my band's next record? I'll shoot the photo.",
        },
      },
      { mine: true, minutesAgo: 60 * 25, body: { es: "¡Claro! Mándame la foto y lo vemos.", en: "Sure! Send me the photo and we'll see." } },
    ],
    replies: [
      { es: "¡Genial! Te la paso hoy en la noche 📸", en: "Great! I'll send it tonight 📸" },
      { es: "Gracias, la banda va a estar feliz.", en: "Thanks, the band will be stoked." },
    ],
  },
]

export const DEMO_CONVERSATION_PREFIX = "demo-chat-"

function artistById(id: string) {
  return ARTISTS.find((a) => a.id === id)!
}

// Demo chats go after the real ones in the inbox.
export function withDemoConversations(
  conversations: ConversationSummary[],
  locale: string,
  now: number
): ConversationSummary[] {
  if (!DEMO_MODE) return conversations
  const demo: ConversationSummary[] = CONVERSATIONS.map((c) => {
    const artist = artistById(c.artist)
    const last = c.messages[c.messages.length - 1]
    return {
      id: c.id,
      other: { id: artist.id, username: artist.username, displayName: artist.displayName, avatarPath: null },
      lastMessage: { body: pick(last.body, locale), fromMe: last.mine, createdAt: new Date(now - last.minutesAgo * 60_000).toISOString() },
      unread: false,
      updatedAt: new Date(now - last.minutesAgo * 60_000).toISOString(),
      demo: true,
    }
  })
  return [...conversations, ...demo]
}

export function getDemoConversation(id: string, meId: string, locale: string, now: number) {
  if (!DEMO_MODE) return null
  const c = CONVERSATIONS.find((conv) => conv.id === id)
  if (!c) return null
  const artist = artistById(c.artist)
  const messages: ChatMessage[] = c.messages.map((m, i) => ({
    id: -1000 - i,
    senderId: m.mine ? meId : artist.id,
    body: pick(m.body, locale),
    createdAt: new Date(now - m.minutesAgo * 60_000).toISOString(),
  }))
  return {
    other: { id: artist.id, username: artist.username, displayName: artist.displayName, avatarPath: null },
    messages,
    replies: c.replies.map((r) => pick(r, locale)),
  }
}
