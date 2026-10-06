import { useVideoConfig } from "remotion"

// Vertical (9:16) vs horizontal (16:9) layout helper. `u` scales sizes so the
// same design reads well in both formats (1 u = 1px at 1080 on the short side).
export function useLayout() {
  const { width, height } = useVideoConfig()
  const vertical = height > width
  const u = Math.min(width, height) / 1080
  return { width, height, vertical, u }
}
