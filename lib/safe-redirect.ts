// Only allow same-origin relative paths to avoid open redirects.
export function safeNextPath(next: unknown, fallback = "/community") {
  if (typeof next !== "string") return fallback
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback
  return next
}
