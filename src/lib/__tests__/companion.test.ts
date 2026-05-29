import { describe, it, expect } from 'vitest'
import { computeCompanionProgress } from '../companion'

const base = { themeKey: 'dinosaurs', unlockedCompanions: ['dinosaurs'] }

describe('computeCompanionProgress — stage', () => {
  it('stage 0 at levels 1–5', () => {
    for (const lvl of [1, 2, 3, 4, 5]) {
      expect(computeCompanionProgress({ ...base, highestUnlockedLevel: lvl }).stage).toBe(0)
    }
  })

  it('stage 1 at levels 6–10', () => {
    for (const lvl of [6, 7, 8, 9, 10]) {
      expect(computeCompanionProgress({ ...base, highestUnlockedLevel: lvl }).stage).toBe(1)
    }
  })

  it('stage 2 at levels 11–21', () => {
    for (const lvl of [11, 12, 16, 20, 21]) {
      expect(computeCompanionProgress({ ...base, highestUnlockedLevel: lvl }).stage).toBe(2)
    }
  })

  it('stage 3 when highestUnlockedLevel > 21 (all levels beaten)', () => {
    expect(computeCompanionProgress({ ...base, highestUnlockedLevel: 22 }).stage).toBe(3)
  })
})

describe('computeCompanionProgress — companion unlocks', () => {
  it('no unlock below level 6', () => {
    expect(computeCompanionProgress({ ...base, highestUnlockedLevel: 5 }).newlyUnlocked).toHaveLength(0)
  })

  it('unlocks 1 companion at milestone 6', () => {
    const result = computeCompanionProgress({ ...base, highestUnlockedLevel: 6 })
    expect(result.newlyUnlocked).toHaveLength(1)
    expect(result.newlyUnlocked[0]).not.toBe('dinosaurs') // never the active theme
  })

  it('unlocks 1 more at milestone 11 (cumulative = 2)', () => {
    // Already have the milestone-6 companion
    const after6 = computeCompanionProgress({ ...base, highestUnlockedLevel: 6 })
    const profile11 = {
      ...base,
      highestUnlockedLevel: 11,
      unlockedCompanions: ['dinosaurs', ...after6.newlyUnlocked],
    }
    const result = computeCompanionProgress(profile11)
    expect(result.newlyUnlocked).toHaveLength(1)
  })

  it('unlocks 1 more at milestone 16 (cumulative = 3)', () => {
    const profile16 = {
      ...base,
      highestUnlockedLevel: 16,
      unlockedCompanions: ['dinosaurs', 'space', 'ocean'],
    }
    const result = computeCompanionProgress(profile16)
    expect(result.newlyUnlocked).toHaveLength(1)
  })

  it('unlocks all remaining at milestone 21', () => {
    // Only have 3 (base + 2 earned)
    const profile21 = {
      ...base,
      highestUnlockedLevel: 21,
      unlockedCompanions: ['dinosaurs', 'space', 'ocean'],
    }
    const result = computeCompanionProgress(profile21)
    // Should unlock the remaining 4 (jungle, unicorns, robots, cats)
    expect(result.newlyUnlocked.length).toBeGreaterThanOrEqual(1)
    expect(result.newlyUnlocked).not.toContain('dinosaurs')
  })

  it('all 7 companions owned after milestone 21 if progressed correctly', () => {
    const fullyProgressed = {
      ...base,
      highestUnlockedLevel: 21,
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
      highestUnlockedLevel: 11,
      unlockedCompanions: ['space', 'dinosaurs', 'ocean'], // already has both expected unlocks
    }
    const result = computeCompanionProgress(profile)
    expect(result.newlyUnlocked).toHaveLength(0)
  })

  it('active themeKey is never in newlyUnlocked', () => {
    for (const themeKey of ['dinosaurs', 'space', 'ocean', 'jungle', 'unicorns', 'robots', 'cats']) {
      const result = computeCompanionProgress({
        themeKey,
        highestUnlockedLevel: 21,
        unlockedCompanions: [themeKey],
      })
      expect(result.newlyUnlocked).not.toContain(themeKey)
    }
  })

  it('if all companions already owned, newlyUnlocked is empty', () => {
    const allOwned = {
      themeKey: 'dinosaurs',
      highestUnlockedLevel: 21,
      unlockedCompanions: ['dinosaurs', 'space', 'ocean', 'jungle', 'unicorns', 'robots', 'cats'],
    }
    expect(computeCompanionProgress(allOwned).newlyUnlocked).toHaveLength(0)
  })
})
