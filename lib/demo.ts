/**
 * DEMO CONTENT — permanent sample artists (Match) and posts (Community).
 *
 * Lives only in code (nothing in the database): swipes and likes on demo items are
 * local, so everything reappears on every refresh.
 *
 * To turn it off: set NEXT_PUBLIC_DEMO_MODE=off.
 * To remove it for good: delete this file and its two call sites
 * (`withDemoCandidates` in app/(app)/match/page.tsx, `withDemoPosts` in app/(app)/community/page.tsx),
 * then the `demo` handling in components/match/match-deck.tsx and
 * components/community/post-card.tsx (search for "demo").
 */
import type { Candidate } from "@/lib/match"
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
