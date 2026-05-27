import { describe, it, expect } from 'vitest'
import { formatDuration, formatAvgTime, speedTier } from '../timing'

// ── formatDuration ────────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('formats 0 ms as 0:00', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('formats exactly 1 minute', () => {
    expect(formatDuration(60_000)).toBe('1:00')
  })

  it('formats 75 seconds as 1:15', () => {
    expect(formatDuration(75_000)).toBe('1:15')
  })

  it('pads single-digit seconds', () => {
    expect(formatDuration(65_000)).toBe('1:05')
  })

  it('formats 2:30', () => {
    expect(formatDuration(150_000)).toBe('2:30')
  })

  it('truncates sub-second ms (floors to seconds)', () => {
    expect(formatDuration(59_999)).toBe('0:59')
  })

  it('handles large values (10 min)', () => {
    expect(formatDuration(600_000)).toBe('10:00')
  })
})

// ── formatAvgTime ─────────────────────────────────────────────────────────────

describe('formatAvgTime', () => {
  it('formats 1000 ms as "1.0s"', () => {
    expect(formatAvgTime(1000)).toBe('1.0s')
  })

  it('formats 3500 ms as "3.5s"', () => {
    expect(formatAvgTime(3500)).toBe('3.5s')
  })

  it('formats 0 ms as "0.0s"', () => {
    expect(formatAvgTime(0)).toBe('0.0s')
  })

  it('rounds to one decimal place', () => {
    expect(formatAvgTime(1234)).toBe('1.2s')
  })

  it('formats 10 seconds', () => {
    expect(formatAvgTime(10_000)).toBe('10.0s')
  })
})

// ── speedTier ─────────────────────────────────────────────────────────────────

describe('speedTier', () => {
  it('0 ms → Lightning', () => {
    expect(speedTier(0).label).toBe('Lightning!')
    expect(speedTier(0).icon).toBe('⚡')
  })

  it('3999 ms → Lightning (boundary)', () => {
    expect(speedTier(3999).label).toBe('Lightning!')
  })

  it('4000 ms → Fast (boundary)', () => {
    expect(speedTier(4000).label).toBe('Fast!')
    expect(speedTier(4000).icon).toBe('🚀')
  })

  it('7999 ms → Fast (boundary)', () => {
    expect(speedTier(7999).label).toBe('Fast!')
  })

  it('8000 ms → Steady (boundary)', () => {
    expect(speedTier(8000).label).toBe('Steady')
    expect(speedTier(8000).icon).toBe('✓')
  })

  it('14999 ms → Steady (boundary)', () => {
    expect(speedTier(14999).label).toBe('Steady')
  })

  it('15000 ms → Keep going (boundary)', () => {
    expect(speedTier(15000).label).toBe('Keep going!')
    expect(speedTier(15000).icon).toBe('💪')
  })

  it('60000 ms → Keep going', () => {
    expect(speedTier(60_000).label).toBe('Keep going!')
  })

  it('all tiers return a non-empty color string', () => {
    [0, 5000, 10000, 20000].forEach(ms => {
      expect(speedTier(ms).color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('tiers are ordered: Lightning < Fast < Steady < Keep going', () => {
    const tiers = [0, 5000, 10000, 20000].map(ms => speedTier(ms).label)
    expect(tiers).toEqual(['Lightning!', 'Fast!', 'Steady', 'Keep going!'])
  })
})
