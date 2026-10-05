"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RetryButton({ label }: { label: string }) {
  return (
    <Button type="button" size="lg" onClick={() => window.location.reload()}>
      <RotateCcw aria-hidden />
      {label}
    </Button>
  )
}
