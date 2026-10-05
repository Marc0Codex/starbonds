import { cn } from "@/lib/utils"

// Plain <img> keeps avatars cheap; initials on plum when there is no picture.
export function ProfileAvatar({
  name,
  src,
  className,
}: {
  name: string
  src: string | null
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return (
    <span
      className={cn(
        "relative inline-grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-plum font-heading text-sm font-bold text-foreground",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <span aria-hidden>{initials || "★"}</span>
      )}
    </span>
  )
}
