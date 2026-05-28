import { Theme } from '@/lib/themes'

// ─────────────────────────────────────────────────────────────
// Sound effects via Web Audio API
// ─────────────────────────────────────────────────────────────
export function createAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)()
  } catch {
    return null
  }
}

export function playTone(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  gain = 0.25,
  type: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt)
  gainNode.gain.setValueAtTime(gain, ctx.currentTime + startAt)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration)
  osc.start(ctx.currentTime + startAt)
  osc.stop(ctx.currentTime + startAt + duration + 0.05)
}

/** Theme-aware correct-answer sound. */
export function playCorrectSound(soundStyle: Theme['soundStyle'] = 'chime') {
  const ctx = createAudioCtx()
  if (!ctx) return
  switch (soundStyle) {
    case 'roar':
      playTone(ctx, 220, 0, 0.12, 0.3, 'sawtooth')
      playTone(ctx, 350, 0.1, 0.2, 0.25, 'sawtooth')
      playTone(ctx, 523.25, 0.22, 0.3, 0.2)
      break
    case 'laser':
      playTone(ctx, 440, 0, 0.08, 0.2, 'square')
      playTone(ctx, 660, 0.07, 0.08, 0.18, 'square')
      playTone(ctx, 880, 0.14, 0.1, 0.16, 'square')
      playTone(ctx, 1100, 0.22, 0.15, 0.14, 'square')
      break
    case 'splash':
      playTone(ctx, 392, 0, 0.18, 0.15)
      playTone(ctx, 523.25, 0.12, 0.22, 0.12)
      playTone(ctx, 440, 0.25, 0.28, 0.1)
      break
    case 'chime':
      // Default arpeggio: C5 → E5 → G5
      playTone(ctx, 523.25, 0, 0.25)
      playTone(ctx, 659.25, 0.12, 0.25)
      playTone(ctx, 783.99, 0.24, 0.35)
      break
    case 'pop':
      playTone(ctx, 600, 0, 0.06, 0.15, 'square')
      playTone(ctx, 800, 0.06, 0.06, 0.12, 'square')
      playTone(ctx, 1000, 0.12, 0.08, 0.1, 'square')
      break
    default:
      playTone(ctx, 523.25, 0, 0.25)
      playTone(ctx, 659.25, 0.12, 0.25)
      playTone(ctx, 783.99, 0.24, 0.35)
  }
}

export function playWrongSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  playTone(ctx, 350, 0, 0.12, 0.2)
  playTone(ctx, 280, 0.1, 0.22, 0.2)
}

export function playLevelCompleteSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5]
  notes.forEach((f, i) => playTone(ctx, f, i * 0.14, 0.4, 0.22))
}

export function playTapSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  playTone(ctx, 800, 0, 0.06, 0.08, 'square')
}
