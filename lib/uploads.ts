export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"] as const
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const ARTWORK_MAX_BYTES = 15 * 1024 * 1024
export const ARTWORK_MAX_IMAGES = 10

export function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName
  return file.type.split("/")[1] ?? "jpg"
}

// Storage paths are always "<owner uid>/..." so RLS can check ownership.
export function isOwnPath(path: string, userId: string) {
  return path.startsWith(`${userId}/`) && !path.includes("..")
}
