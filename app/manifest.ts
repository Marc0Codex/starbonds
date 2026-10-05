import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "STARBONDS",
    short_name: "STARBONDS",
    description: "La red social para artistas · The social network for artists",
    start_url: "/community",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d0a12",
    theme_color: "#0d0a12",
    categories: ["social", "art", "lifestyle"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
