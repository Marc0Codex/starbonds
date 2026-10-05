import { Bell, MessageCircle, Settings, ShoppingBag, User, Users } from "lucide-react"
import type { ComponentType } from "react"

import { StarIcon } from "@/components/brand/star-icon"

export type NavKey = "community" | "marketplace" | "match" | "messages" | "activity" | "profile" | "settings"

export type NavItem = {
  key: NavKey
  href: string
  icon: ComponentType<{ className?: string }>
  mobile: boolean
}

// Bottom nav on mobile holds max 5 items; activity & settings live in the mobile header.
export const NAV_ITEMS: NavItem[] = [
  { key: "community", href: "/community", icon: Users, mobile: true },
  { key: "marketplace", href: "/marketplace", icon: ShoppingBag, mobile: true },
  { key: "match", href: "/match", icon: StarIcon, mobile: true },
  { key: "messages", href: "/messages", icon: MessageCircle, mobile: true },
  { key: "activity", href: "/activity", icon: Bell, mobile: false },
  { key: "profile", href: "/profile", icon: User, mobile: true },
  { key: "settings", href: "/settings", icon: Settings, mobile: false },
]

export function isActive(pathname: string, href: string) {
  if (href === "/profile") return pathname.startsWith("/profile") || pathname.startsWith("/u/")
  return pathname === href || pathname.startsWith(`${href}/`)
}
