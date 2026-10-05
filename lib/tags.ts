import type { Tables } from "@/types/database"

type Tag = Tables<"tags">

export const TAG_KINDS = ["medium", "style", "goal"] as const
export const MAX_TAGS = 15

export function tagLabel(tag: Pick<Tag, "name_es" | "name_en">, locale: string) {
  return locale === "en" ? tag.name_en : tag.name_es
}

export function groupTags<T extends Pick<Tag, "kind">>(tags: T[]) {
  return {
    medium: tags.filter((t) => t.kind === "medium"),
    style: tags.filter((t) => t.kind === "style"),
    goal: tags.filter((t) => t.kind === "goal"),
  }
}
