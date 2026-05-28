import { describe, it, expect } from 'vitest'
import { computeCompanionProgress } from '../companion'

const base = { themeKey: 'dinosaurs', unlockedCompanions: ['dinosaurs'] }

describe('computeCompanionProgress — stage', () => {
  it('stage 0 at levels 1–4', () => {
    for (const lvl of [1, 2, 3, 4]) {
      expect(computeCompanionProgress({ ...base, highestUnlockedLevel: lvl }).stage).toBe(0)
    }
  })

  it('stage 1 at levels 5–9', () => {
    for (const lvl of [5, 6, 7, 8, 9]) {
      expect(computeCompanionProgress({ ...base, highestUnlockedLevel: lvl }).stage).toBe(1)
    }
  })

  it('stage 2 at levels 10–20', () => {
    for (const lvl of [10, 11, 15, 19, 20]) {
      expect(computeCompanionProgress({ ...base, highestUnlockedLevel: lvl }).stage).toBe(2)
    }
  })

  it('stage 3 when highestUnlockedLevel > 20 (all levels beaten)', () => {
    expect(computeCompanionProgress({ ...base, highestUnlockedLevel: 21 }).stage).toBe(3)
  })
})

describe('computeCompanionProgress — companion unlocks', () => {
  it('no unlock below level 5', () => {
    expect(computeCompanionProgress({ ...base, highestUnlockedLevel: 4 }).newlyUnlocked).toHaveLength(0)
  })

  it('unlocks 1 companion at milestone 5', () => {
    const result = computeCompanionProgress({ ...base, highestUnlockedLevel: 5 })
    expect(result.newlyUnlocked).toHaveLength(1)
    expect(result.newlyUnlocked[0]).not.toBe('dinosaurs') // never the active theme
  })

  it('unlocks 1 more at milestone 10 (cumulative = 2)', () => {
    // Already have the milestone-5 companion
    const after5 = computeCompanionProgress({ ...base, highestUnlockedLevel: 5 })
    const profile10 = {
      ...base,
      highestUnlockedLevel: 10,
      unlockedCompanions: ['dinosaurs', ...after5.newlyUnlocked],
    }
    const result = computeCompanionProgress(profile10)
    expect(result.newlyUnlocked).toHaveLength(1)
  })

  it('unlocks 1 more at milestone 15 (cumulative = 3)', () => {
    const profile15 = {
      ...base,
      highestUnlockedLevel: 15,
      unlockedCompanions: ['dinosaurs', 'space', 'ocean'],
    }
    const result = computeCompanionProgress(profile15)
    expect(result.newlyUnlocked).toHaveLength(1)
  })

  it('unlocks all remaining at milestone 20', () => {
    // Only have 3 (base + 2 earned)
    const profile20 = {
      ...base,
      highestUnlockedLevel: 20,
      unlockedCompanions: ['dinosaurs', 'space', 'ocean'],
    }
    const result = computeCompanionProgress(profile20)
    // Should unlock the remaining 4 (jungle, unicorns, robots, cats)
    expect(result.newlyUnlocked.length).toBeGreaterThanOrEqual(1)
    expect(result.newlyUnlocked).not.toContain('dinosaurs')
  })

  it('all 7 companions owned after milestone 20 if progressed correctly', () => {
    const fullyProgressed = {
      ...base,
      highestUnlockedLevel: 20,
      unlockedCompanions: ['dinosaurs'], // only own starting theme
    }
    const result = computeCompanionProgress(fullyProgressed)
    // Should unlock 6 others (all non-dino companions)
    expect(result.newlyUnlocked).toHaveLength(6)
    const total = new Set([...fullyProgressed.unlockedCompanions, ...result.newlyUnlocked])
    expect(total.size).toBe(7)
  })

  it('idempotent — already unlocked companions are not re-added', () => {
    const profile = {
      themeKey: 'space',
      highestUnlockedLevel: 10,
      unlockedCompanions: ['space', 'dinosaurs', 'ocean'], // already has both expected unlocks
    }
    const result = computeCompanionProgress(profile)
    expect(result.newlyUnlocked).toHaveLength(0)
  })

  it('active themeKey is never in newlyUnlocked', () => {
    for (const themeKey of ['dinosaurs', 'space', 'ocean', 'jungle', 'unicorns', 'robots', 'cats']) {
      const result = computeCompanionProgress({
        themeKey,
        highestUnlockedLevel: 20,
        unlockedCompanions: [themeKey],
      })
      expect(result.newlyUnlocked).not.toContain(themeKey)
    }
  })

  it('if all companions already owned, newlyUnlocked is empty', () => {
    const allOwned = {
      themeKey: 'dinosaurs',
      highestUnlockedLevel: 20,
      unlockedCompanions: ['dinosaurs', 'space', 'ocean', 'jungle', 'unicorns', 'robots', 'cats'],
    }
    expect(computeCompanionProgress(allOwned).newlyUnlocked).toHaveLength(0)
  })
})
