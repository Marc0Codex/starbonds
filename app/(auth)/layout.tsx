import Link from "next/link"

import { Star } from "@/components/brand/star"
import { Logo } from "@/components/logo"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <Star spin className="pointer-events-none absolute -right-24 -top-24 size-80 text-plum" />
      <Star spin className="pointer-events-none absolute -bottom-16 -left-16 size-48 text-raise" />
      <header className="relative px-5 py-6 sm:px-10">
        <Link href="/" aria-label="STARBONDS">
          <Logo />
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
