"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import { ARTWORK_MAX_IMAGES, isOwnPath } from "@/lib/uploads"

export type ArtworkErrorKey = "titleRequired" | "imagesRequired" | "tooManyImages" | "yearInvalid" | "generic"
export type ArtworkState = { error?: ArtworkErrorKey } | undefined

const artworkSchema = z.object({
  title: z.string().trim().min(1, { error: "titleRequired" }).max(120, { error: "titleRequired" }),
  description: z
    .string()
    .trim()
    .max(2000, { error: "generic" })
    .transform((v) => (v.length ? v : null)),
  year: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}$/.test(v), { error: "yearInvalid" })
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (v >= 1000 && v <= new Date().getFullYear() + 1), { error: "yearInvalid" }),
  images: z
    .array(z.string())
    .min(1, { error: "imagesRequired" })
    .max(ARTWORK_MAX_IMAGES, { error: "tooManyImages" }),
})

export async function createArtwork(formData: FormData): Promise<ArtworkState> {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const parsed = artworkSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    year: formData.get("year") ?? "",
    images: formData.getAll("images").filter((v): v is string => typeof v === "string"),
  })
  if (!parsed.success) return { error: (parsed.error.issues[0]?.message as ArtworkErrorKey) ?? "generic" }
  if (!parsed.data.images.every((path) => isOwnPath(path, current.userId))) return { error: "generic" }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("artworks")
    .insert({
      owner_id: current.userId,
      title: parsed.data.title,
      description: parsed.data.description,
      year: parsed.data.year,
      images: parsed.data.images,
    })
    .select("id")
    .single()
  if (error || !data) return { error: "generic" }

  redirect(`/artworks/${data.id}`)
}

export async function deleteArtwork(artworkId: string) {
  const current = await getCurrentProfile()
  if (!current) redirect("/login")

  const supabase = await createClient()
  const { data: artwork } = await supabase
    .from("artworks")
    .select("images")
    .eq("id", artworkId)
    .eq("owner_id", current.userId)
    .maybeSingle()
  if (!artwork) return { error: "generic" as const }

  const { error } = await supabase.from("artworks").delete().eq("id", artworkId).eq("owner_id", current.userId)
  if (error) return { error: "generic" as const }

  const ownImages = artwork.images.filter((path) => isOwnPath(path, current.userId))
  if (ownImages.length) await supabase.storage.from("artworks").remove(ownImages)

  redirect(`/u/${current.profile.username}`)
}
