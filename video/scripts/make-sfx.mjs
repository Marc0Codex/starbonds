// Synthesizes the explainer's sound effects as 16-bit mono WAVs in public/sfx/.
// Pure code, no samples, so there are no licensing questions. Run: npm run sfx
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

const RATE = 44100
const OUT = path.resolve(process.cwd(), "public/sfx")

// Deterministic noise so re-running produces identical files.
let seed = 1234567
function noise() {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return (seed / 0xffffffff) * 2 - 1
}

function buffer(seconds) {
  return new Float32Array(Math.round(seconds * RATE))
}

function sine(phase) {
  return Math.sin(phase * Math.PI * 2)
}

function triangle(phase) {
  const p = phase % 1
  return 4 * Math.abs(p - 0.5) - 1
}

/** Adds a tone whose frequency glides from f0 to f1 with an attack/exponential-decay envelope. */
function tone(buf, { at = 0, dur, f0, f1 = f0, gain = 1, attack = 0.004, decay = 6, wave = sine }) {
  const start = Math.round(at * RATE)
  const n = Math.round(dur * RATE)
  let phase = 0
  for (let i = 0; i < n && start + i < buf.length; i++) {
    const t = i / RATE
    const f = f0 + (f1 - f0) * (i / n)
    phase += f / RATE
    const env = Math.min(1, t / attack) * Math.exp((-decay * t) / dur)
    // Short fade at the tail to avoid clicks.
    const tail = Math.min(1, (n - i) / (0.004 * RATE))
    buf[start + i] += wave(phase) * env * tail * gain
  }
}

/** Noise through a one-pole low-pass whose cutoff follows `cutoff(t)`; envelope from `env(t)`. */
function filteredNoise(buf, { at = 0, dur, cutoff, env, gain = 1 }) {
  const start = Math.round(at * RATE)
  const n = Math.round(dur * RATE)
  let low = 0
  let low2 = 0
  for (let i = 0; i < n && start + i < buf.length; i++) {
    const t = i / n
    const a = 1 - Math.exp((-2 * Math.PI * cutoff(t)) / RATE)
    low += a * (noise() - low)
    low2 += a * (low - low2)
    buf[start + i] += low2 * env(t) * gain
  }
}

function normalize(buf, peak) {
  let max = 0
  for (const v of buf) max = Math.max(max, Math.abs(v))
  if (max > 0) for (let i = 0; i < buf.length; i++) buf[i] = (buf[i] / max) * peak
  return buf
}

function writeWav(name, buf) {
  const data = Buffer.alloc(buf.length * 2)
  for (let i = 0; i < buf.length; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767), i * 2)
  }
  const header = Buffer.alloc(44)
  header.write("RIFF", 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write("WAVE", 8)
  header.write("fmt ", 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(RATE, 24)
  header.writeUInt32LE(RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write("data", 36)
  header.writeUInt32LE(data.length, 40)
  writeFileSync(path.join(OUT, `${name}.wav`), Buffer.concat([header, data]))
}

const SFX = {
  // Scene transition: airy noise sweep that rises then falls.
  whoosh() {
    const b = buffer(0.45)
    filteredNoise(b, {
      dur: 0.45,
      cutoff: (t) => 300 + 5200 * Math.sin(Math.PI * Math.min(1, t * 1.15)),
      env: (t) => Math.pow(Math.sin(Math.PI * t), 1.6),
    })
    return normalize(b, 0.8)
  },
  // Swiping a card: shorter, brighter whoosh.
  swipe() {
    const b = buffer(0.26)
    filteredNoise(b, {
      dur: 0.26,
      cutoff: (t) => 1200 + 6000 * t,
      env: (t) => Math.pow(Math.sin(Math.PI * t), 1.2),
    })
    return normalize(b, 0.75)
  },
  // Something appears: round pitch-drop bubble.
  pop() {
    const b = buffer(0.12)
    tone(b, { dur: 0.12, f0: 820, f1: 320, decay: 5 })
    return normalize(b, 0.8)
  },
  // Button press: tiny click plus a high blip.
  tap() {
    const b = buffer(0.06)
    filteredNoise(b, { dur: 0.012, cutoff: () => 6000, env: (t) => 1 - t, gain: 0.6 })
    tone(b, { dur: 0.05, f0: 1900, f1: 1500, decay: 9, gain: 0.5 })
    return normalize(b, 0.7)
  },
  // Tags and counters: very short tick.
  tick() {
    const b = buffer(0.035)
    tone(b, { dur: 0.035, f0: 2600, decay: 10 })
    return normalize(b, 0.55)
  },
  // Like: two bright rising notes.
  like() {
    const b = buffer(0.32)
    tone(b, { dur: 0.16, f0: 1318.5, decay: 5, wave: triangle })
    tone(b, { at: 0.07, dur: 0.25, f0: 1975.5, decay: 5, wave: triangle })
    return normalize(b, 0.7)
  },
  // New chat message: soft upward "bloop".
  message() {
    const b = buffer(0.16)
    tone(b, { dur: 0.16, f0: 520, f1: 1040, decay: 4 })
    tone(b, { dur: 0.16, f0: 1040, f1: 2080, decay: 6, gain: 0.2 })
    return normalize(b, 0.7)
  },
  // Notification: two-note bell.
  notify() {
    const b = buffer(0.55)
    for (const [at, f] of [[0, 783.99], [0.1, 1174.66]]) {
      tone(b, { at, dur: 0.45, f0: f, decay: 5 })
      tone(b, { at, dur: 0.3, f0: f * 2.76, decay: 8, gain: 0.25 })
    }
    return normalize(b, 0.7)
  },
  // Match: major arpeggio with bell partials.
  chime() {
    const b = buffer(1.2)
    const notes = [1046.5, 1318.5, 1568, 2093]
    notes.forEach((f, i) => {
      tone(b, { at: i * 0.075, dur: 1.2 - i * 0.075, f0: f, decay: 4.5 })
      tone(b, { at: i * 0.075, dur: 0.5, f0: f * 2, decay: 7, gain: 0.3 })
    })
    return normalize(b, 0.75)
  },
  // Plei's sparkles: scattered high tinkles.
  sparkle() {
    const b = buffer(0.75)
    for (let i = 0; i < 9; i++) {
      const f = 2400 + ((noise() + 1) / 2) * 3200
      tone(b, { at: i * 0.06 + ((noise() + 1) / 2) * 0.03, dur: 0.18, f0: f, decay: 7, gain: 1 - i * 0.07 })
    }
    return normalize(b, 0.55)
  },
  // Intro: rising shimmer as the star wakes up.
  rise() {
    const b = buffer(0.9)
    filteredNoise(b, { dur: 0.9, cutoff: (t) => 400 + 7000 * t * t, env: (t) => t * t * (1 - t) * 6, gain: 0.5 })
    tone(b, { dur: 0.9, f0: 220, f1: 880, attack: 0.3, decay: 1.5, wave: triangle, gain: 0.35 })
    return normalize(b, 0.7)
  },
  // Outro hit: low thump with a bright tail.
  hit() {
    const b = buffer(0.9)
    tone(b, { dur: 0.35, f0: 140, f1: 48, decay: 4 })
    filteredNoise(b, { dur: 0.08, cutoff: () => 3000, env: (t) => 1 - t, gain: 0.4 })
    tone(b, { at: 0.02, dur: 0.85, f0: 1568, decay: 4, gain: 0.25 })
    tone(b, { at: 0.02, dur: 0.85, f0: 2349.3, decay: 4, gain: 0.18 })
    return normalize(b, 0.85)
  },
}

mkdirSync(OUT, { recursive: true })
for (const [name, make] of Object.entries(SFX)) {
  writeWav(name, make())
  console.log(`sfx/${name}.wav`)
}
