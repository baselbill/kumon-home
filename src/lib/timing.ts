// ─────────────────────────────────────────────────────────────
// Timing helpers — used by MathGame and tests
// ─────────────────────────────────────────────────────────────

/** Format milliseconds as M:SS  (e.g. 75000 → "1:15") */
export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const min = Math.floor(s / 60)
  const sec = s % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/** Convert average response-time in ms to a friendly string, e.g. "3.2s" */
export function formatAvgTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}

export interface SpeedTier {
  label: string
  icon: string
  color: string
}

/**
 * Classify average response time into a speed tier.
 *
 * < 4 s  → Lightning  ⚡ (amber)
 * < 8 s  → Fast       🚀 (blue)
 * < 15 s → Steady     ✓  (green)
 * ≥ 15 s → Keep going 💪 (gray)
 */
export function speedTier(avgMs: number): SpeedTier {
  if (avgMs < 4000)  return { label: 'Lightning!', icon: '⚡', color: '#F59E0B' }
  if (avgMs < 8000)  return { label: 'Fast!',      icon: '🚀', color: '#3B82F6' }
  if (avgMs < 15000) return { label: 'Steady',     icon: '✓',  color: '#22C55E' }
  return               { label: 'Keep going!', icon: '💪', color: '#9CA3AF' }
}
