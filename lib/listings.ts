import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export const LISTINGS_PAGE_SIZE = 24

export type ListingKind = Tables<"listings">["kind"]
export type ListingSort = "recent" | "price_asc" | "price_desc"

export type ListingCardData = {
  id: string
  kind: ListingKind
  title: string
  priceCents: number
  currency: string
  cover: string | null
  status: Tables<"listings">["status"]
  seller: { username: string; displayName: string; avatarPath: string | null }
}

const SELLER = "seller:profiles!listings_seller_id_fkey(id, username, display_name, avatar_path)"

type Row = Tables<"listings"> & {
  seller: { id: string; username: string; display_name: string; avatar_path: string | null } | null
}

function toCard(row: Row): ListingCardData | null {
  if (!row.seller) return null
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    priceCents: row.price_cents,
    currency: row.currency,
    cover: row.images[0] ?? null,
    status: row.status,
    seller: { username: row.seller.username, displayName: row.seller.display_name, avatarPath: row.seller.avatar_path },
  }
}

export async function browseListings(filters: {
  kind?: ListingKind
  mediumTagId?: number
  q?: string
  sort?: ListingSort
  page?: number
}) {
  const supabase = await createClient()
  const page = Math.max(0, filters.page ?? 0)
  let query = supabase.from("listings").select(`*, ${SELLER}`).eq("status", "active")
  if (filters.kind) query = query.eq("kind", filters.kind)
  if (filters.mediumTagId) query = query.eq("medium_tag_id", filters.mediumTagId)
  if (filters.q) {
    // Escape LIKE wildcards in user input.
    const term = filters.q.replace(/[%_\\]/g, (c) => `\\${c}`)
    query = query.ilike("title", `%${term}%`)
  }
  query =
    filters.sort === "price_asc"
      ? query.order("price_cents", { ascending: true })
      : filters.sort === "price_desc"
        ? query.order("price_cents", { ascending: false })
        : query.order("created_at", { ascending: false })

  const { data } = await query.range(page * LISTINGS_PAGE_SIZE, page * LISTINGS_PAGE_SIZE + LISTINGS_PAGE_SIZE)
  const rows = (data ?? []) as unknown as Row[]
  return {
    listings: rows.slice(0, LISTINGS_PAGE_SIZE).map(toCard).filter((c): c is ListingCardData => Boolean(c)),
    hasMore: rows.length > LISTINGS_PAGE_SIZE,
  }
}

export async function getListing(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("listings")
    .select(`*, ${SELLER}, medium:tags!listings_medium_tag_id_fkey(*)`)
    .eq("id", id)
    .maybeSingle()
  return data
}

// Seller's listings for their profile: active + sold for visitors, everything for the owner.
export async function getSellerListings(sellerId: string, isOwner: boolean) {
  const supabase = await createClient()
  let query = supabase
    .from("listings")
    .select(`*, ${SELLER}`)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(24)
  if (!isOwner) query = query.in("status", ["active", "sold"])
  const { data } = await query
  return ((data ?? []) as unknown as Row[]).map(toCard).filter((c): c is ListingCardData => Boolean(c))
}
