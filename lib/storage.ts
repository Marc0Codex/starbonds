export type PublicBucket = "avatars" | "artworks"

// Storage paths are saved in the DB; external URLs (e.g. Google avatars) pass through.
export function publicUrl(bucket: PublicBucket, path: string | null | undefined) {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
