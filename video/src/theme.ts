import { loadFont as loadInstrumentSans } from "@remotion/google-fonts/InstrumentSans"
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif"
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne"

// "Noche violeta" tokens, mirrored from app/globals.css. Flat colors only.
export const C = {
  ink: "#0d0a12",
  card: "#16101f",
  raise: "#1f1730",
  plum: "#3b1f6b",
  grape: "#5b2a86",
  lavender: "#bfa8ff",
  spark: "#dfff4f",
  sparkInk: "#1a0f2e",
  paper: "#f1ebf8",
  mist: "#a99cbd",
  line: "#2d2240",
} as const

export const FONT = {
  display: loadSyne("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily,
  body: loadInstrumentSans("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily,
  serif: loadInstrumentSerif("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily,
}
