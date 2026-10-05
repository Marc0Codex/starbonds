// Flat geometric compositions standing in for artworks on the landing page.
export function ArtTiles({ labels, ariaLabel }: { labels: string[]; ariaLabel: string }) {
  return (
    <div aria-label={ariaLabel} role="img" className="grid min-w-0 flex-[1_1_380px] grid-cols-2 gap-4">
      <figure className="lift float relative m-0 aspect-[3/4] overflow-hidden rounded-[20px] border bg-plum">
        <div className="orbit absolute left-[18%] top-[14%] aspect-square w-[64%] rounded-full border-2 border-primary" />
        <div className="absolute left-[36%] top-[32%] aspect-square w-[28%] rounded-full bg-spark" />
        <div className="absolute bottom-0 left-0 h-[30%] w-full bg-grape" />
        <figcaption className="absolute bottom-3 left-3.5 text-xs">{labels[0]}</figcaption>
      </figure>
      <figure
        className="lift float relative m-0 mt-12 aspect-[3/4] overflow-hidden rounded-[20px] border bg-foreground"
        style={{ "--delay": "-2s" } as React.CSSProperties}
      >
        <div className="absolute left-[12%] top-[12%] h-[58%] w-[46%] rounded-t-full bg-grape" />
        <div className="absolute right-[12%] top-[34%] h-[46%] w-[34%] bg-background" />
        <div className="absolute bottom-[14%] left-[12%] h-1.5 w-[76%] bg-plum" />
        <figcaption className="absolute bottom-3 left-3.5 text-xs text-primary-foreground">{labels[1]}</figcaption>
      </figure>
      <figure
        className="lift float relative m-0 -mt-12 aspect-square overflow-hidden rounded-[20px] border bg-card"
        style={{ "--delay": "-4s" } as React.CSSProperties}
      >
        <div className="absolute inset-[18%] rotate-45 border-2 border-primary" />
        <div className="absolute left-[30%] top-[30%] h-[40%] w-[40%] rotate-45 bg-primary" />
        <figcaption className="absolute bottom-3 left-3.5 text-xs text-muted-foreground">{labels[2]}</figcaption>
      </figure>
      <figure className="lift float relative m-0 aspect-square overflow-hidden rounded-[20px] border bg-spark">
        <div className="absolute -left-[10%] top-[20%] aspect-square w-[70%] rounded-full bg-plum" />
        <div className="absolute right-[10%] top-[12%] aspect-square w-[30%] rounded-full border-2 border-spark-foreground" />
        <figcaption className="absolute bottom-3 left-3.5 text-xs text-spark-foreground">{labels[3]}</figcaption>
      </figure>
    </div>
  )
}
