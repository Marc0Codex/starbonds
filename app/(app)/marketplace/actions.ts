"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { CURRENCIES } from "@/lib/format"
import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import { isOwnPath, LISTING_MAX_IMAGES } from "@/lib/uploads"

export type ListingErrorKey =
  | "titleInvalid"
  | "priceInvalid"
  | "imagesRequired"
  | "tooManyImages"
  | "descriptionTooLong"
  | "generic"

async function requireUser() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")
  return current
}

const listingSchema = z.object({
  id: z.uuid().nullable(),
  kind: z.enum(["artwork", "service"]),
  title: z.string().trim().min(3, { error: "titleInvalid" }).max(120, { error: "titleInvalid" }),
  description: z.string().trim().max(4000, { error: "descriptionTooLong" }),
  price: z
    .string()
    .trim()
    .transform((v) => Number(v.replace(",", ".")))
    .refine((v) => Number.isFinite(v) && v >= 0 && v <= 10_000_000, { error: "priceInvalid" }),
  currency: z.enum(CURRENCIES),
  mediumTagId: z.number().int().positive().nullable(),
  artworkId: z.uuid().nullable(),
  images: z
    .array(z.string())
    .min(1, { error: "imagesRequired" })
    .max(LISTING_MAX_IMAGES, { error: "tooManyImages" }),
})

export type ListingInput = z.input<typeof listingSchema>

export async function saveListing(input: ListingInput): Promise<{ error: ListingErrorKey }> {
  const { userId } = await requireUser()
  const parsed = listingSchema.safeParse(input)
  if (!parsed.success) return { error: (parsed.error.issues[0]?.message as ListingErrorKey) ?? "generic" }
  const v = parsed.data
  if (!v.images.every((path) => isOwnPath(path, userId))) return { error: "generic" }

  const supabase = await createClient()
  const fields = {
    kind: v.kind,
    title: v.title,
    description: v.description,
    price_cents: Math.round(v.price * 100),
    currency: v.currency,
    medium_tag_id: v.mediumTagId,
    artwork_id: v.artworkId,
    images: v.images,
  }

  let id = v.id
  if (id) {
    const { data: before } = await supabase.from("listings").select("images").eq("id", id).eq("seller_id", userId).maybeSingle()
    if (!before) return { error: "generic" }
    const { error } = await supabase.from("listings").update(fields).eq("id", id).eq("seller_id", userId)
    if (error) return { error: "generic" }
    // Remove listing-only images that were dropped (portfolio images are never deleted here).
    const dropped = before.images.filter((p) => !v.images.includes(p) && p.startsWith(`${userId}/listings/`))
    if (dropped.length) await supabase.storage.from("artworks").remove(dropped)
  } else {
    const { data, error } = await supabase
      .from("listings")
      .insert({ ...fields, seller_id: userId })
      .select("id")
      .single()
    if (error || !data) return { error: "generic" }
    id = data.id
  }

  revalidatePath("/marketplace")
  redirect(`/listing/${id}`)
}

export async function setListingStatus(id: string, status: "active" | "sold" | "hidden") {
  const { userId } = await requireUser()
  const supabase = await createClient()
  const { error } = await supabase.from("listings").update({ status }).eq("id", id).eq("seller_id", userId)
  revalidatePath(`/listing/${id}`)
  revalidatePath("/marketplace")
  return { ok: !error }
}

export async function deleteListing(id: string) {
  const { userId, profile } = await requireUser()
  const supabase = await createClient()
  const { data: listing } = await supabase.from("listings").select("images").eq("id", id).eq("seller_id", userId).maybeSingle()
  if (!listing) return { ok: false }
  const { error } = await supabase.from("listings").delete().eq("id", id).eq("seller_id", userId)
  if (error) return { ok: false }
  const own = listing.images.filter((p) => p.startsWith(`${userId}/listings/`))
  if (own.length) await supabase.storage.from("artworks").remove(own)
  revalidatePath("/marketplace")
  redirect(`/u/${profile.username}`)
}

// Opens (or reuses) the chat with the seller about this listing.
export async function contactSeller(listingId: string) {
  const { userId } = await requireUser()
  const supabase = await createClient()
  const { data: listing } = await supabase.from("listings").select("seller_id").eq("id", listingId).maybeSingle()
  if (!listing || listing.seller_id === userId) return { ok: false }
  const { data: conversationId, error } = await supabase.rpc("start_conversation", {
    p_other: listing.seller_id,
    p_listing: listingId,
  })
  if (error || !conversationId) return { ok: false }
  redirect(`/messages/${conversationId}`)
}
