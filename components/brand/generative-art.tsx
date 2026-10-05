// Flat geometric composition seeded by a string (no gradients).
export function GenerativeArt({ seed, className }: { seed: string; className?: string }) {
  const n = [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7)
  const palettes = [
    ["#3b1f6b", "#bfa8ff", "#dfff4f", "#5b2a86"],
    ["#f1ebf8", "#5b2a86", "#3b1f6b", "#bfa8ff"],
    ["#dfff4f", "#3b1f6b", "#1a0f2e", "#5b2a86"],
    ["#16101f", "#bfa8ff", "#5b2a86", "#dfff4f"],
  ]
  const [bg, ring, dot, ground] = palettes[n % palettes.length]
  const left = 14 + (n % 20)
  const top = 10 + ((n >> 3) % 16)
  const square = (n >> 5) % 3 === 0

  return (
    <div className={className ?? "absolute inset-0"} style={{ background: bg }} aria-hidden>
      <div
        className="orbit absolute aspect-square w-[64%] rounded-full border-2 border-dashed"
        style={{ left: `${left}%`, top: `${top}%`, borderColor: ring }}
      />
      <div
        className={square ? "absolute aspect-square w-[30%] rotate-45" : "absolute aspect-square w-[30%] rounded-full"}
        style={{ left: `${left + 17}%`, top: `${top + 17}%`, background: dot }}
      />
      <div className="absolute bottom-0 left-0 h-[24%] w-full" style={{ background: ground }} />
    </div>
  )
}
