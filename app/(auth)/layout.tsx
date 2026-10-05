import Link from "next/link"

import { Logo } from "@/components/logo"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
      <Link href="/" aria-label="STARBONDS">
        <Logo />
      </Link>
      <main className="w-full max-w-sm">{children}</main>
    </div>
  )
}
