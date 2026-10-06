"use client"

import { Check, Link2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyLink({ url, label, copiedLabel }: { url: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="press"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard blocked: leave the visible URL for manual copy.
        }
      }}
    >
      {copied ? <Check className="pop text-spark" aria-hidden /> : <Link2 aria-hidden />}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </Button>
  )
}
