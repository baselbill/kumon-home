import { describe, it, expect } from 'vitest'
import { PRESET_THEMES, resolveTheme, getLocationForLevel } from '../themes'

describe('PRESET_THEMES', () => {
  it('has 7 themes', () => {
    expect(PRESET_THEMES).toHaveLength(7)
  })

  it('all themes have required fields', () => {
    for (const theme of PRESET_THEMES) {
      expect(theme.key).toBeTruthy()
      expect(theme.label).toBeTruthy()
      expect(theme.mascot).toBeTruthy()
      expect(theme.dotEmoji).toBeTruthy()
      expect(theme.plural).toBeTruthy()
      expect(theme.noun).toBeTruthy()
      expect(theme.celebrationLine).toBeTruthy()
      expect(theme.shortFeedback).toBeTruthy()
      expect(['roar', 'laser', 'splash', 'chime', 'pop']).toContain(theme.soundStyle)
    }
  })

  it('dinosaurs is first (default fallback)', () => {
    expect(PRESET_THEMES[0].key).toBe('dinosaurs')
  })

  it('all keys are unique', () => {
    const keys = PRESET_THEMES.map(t => t.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('shortFeedback is non-empty for all presets', () => {
    for (const theme of PRESET_THEMES) {
      expect(theme.shortFeedback.length).toBeGreaterThan(0)
    }
  })
})

describe('ThemeLocation', () => {
  it('every theme has exactly 4 locations', () => {
    for (const theme of PRESET_THEMES) {
      expect(theme.locations).toHaveLength(4)
    }
  })

  it('all location ranges cover 1–21 contiguously with no gaps or overlaps', () => {
    for (const theme of PRESET_THEMES) {
      const sorted = [...theme.locations].sort((a, b) => a.levelRange[0] - b.levelRange[0])
      expect(sorted[0].levelRange[0]).toBe(1)
      expect(sorted[3].levelRange[1]).toBe(21)
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].levelRange[1] + 1).toBe(sorted[i + 1].levelRange[0])
      }
    }
  })

  it('all locations have required fields', () => {
    for (const theme of PRESET_THEMES) {
      for (const loc of theme.locations) {
        expect(loc.name).toBeTruthy()
        expect(loc.icon).toBeTruthy()
        expect(loc.storyHook).toBeTruthy()
        expect(loc.levelRange).toHaveLength(2)
        expect(loc.levelRange[0]).toBeLessThan(loc.levelRange[1])
      }
    }
  })
})

describe('getLocationForLevel', () => {
  const dino = PRESET_THEMES[0] // dinosaurs

  it('returns the location covering a given level', () => {
    expect(getLocationForLevel(dino, 1).levelRange[0]).toBe(1)
    expect(getLocationForLevel(dino, 5).levelRange[1]).toBe(5)
    expect(getLocationForLevel(dino, 6).levelRange[0]).toBe(6)
    expect(getLocationForLevel(dino, 11).levelRange[1]).toBe(11)
    expect(getLocationForLevel(dino, 12).levelRange[0]).toBe(12)
    expect(getLocationForLevel(dino, 16).levelRange[1]).toBe(16)
    expect(getLocationForLevel(dino, 17).levelRange[0]).toBe(17)
    expect(getLocationForLevel(dino, 21).levelRange[1]).toBe(21)
  })

  it('boundaries return different locations on each side', () => {
    expect(getLocationForLevel(dino, 5).name).not.toBe(getLocationForLevel(dino, 6).name)
    expect(getLocationForLevel(dino, 11).name).not.toBe(getLocationForLevel(dino, 12).name)
    expect(getLocationForLevel(dino, 16).name).not.toBe(getLocationForLevel(dino, 17).name)
  })

  it('works correctly for all 7 themes', () => {
    for (const theme of PRESET_THEMES) {
      expect(getLocationForLevel(theme, 1).levelRange[0]).toBe(1)
      expect(getLocationForLevel(theme, 21).levelRange[1]).toBe(21)
      // mid-tier level should not be the first or last location
      expect(getLocationForLevel(theme, 8).levelRange[0]).toBeGreaterThan(1)
      expect(getLocationForLevel(theme, 14).levelRange[1]).toBeLessThan(21)
    }
  })
})

describe('resolveTheme', () => {
  it('exact key match → that theme', () => {
    expect(resolveTheme('dinosaurs').key).toBe('dinosaurs')
    expect(resolveTheme('space').key).toBe('space')
    expect(resolveTheme('ocean').key).toBe('ocean')
    expect(resolveTheme('jungle').key).toBe('jungle')
    expect(resolveTheme('unicorns').key).toBe('unicorns')
    expect(resolveTheme('robots').key).toBe('robots')
    expect(resolveTheme('cats').key).toBe('cats')
  })

  it('case-insensitive match', () => {
    expect(resolveTheme('DINOSAURS').key).toBe('dinosaurs')
    expect(resolveTheme('CATS').key).toBe('cats')
    expect(resolveTheme('Space').key).toBe('space')
  })

  it('key appears among multiple words', () => {
    expect(resolveTheme('ninja cats').key).toBe('cats')
    expect(resolveTheme('I love robots').key).toBe('robots')
    expect(resolveTheme('underwater ocean adventure').key).toBe('ocean')
  })

  it('no match → dinosaurs fallback', () => {
    expect(resolveTheme('pirate ships').key).toBe('dinosaurs')
    expect(resolveTheme('').key).toBe('dinosaurs')
    expect(resolveTheme('xyz').key).toBe('dinosaurs')
    expect(resolveTheme('robot').key).toBe('dinosaurs') // 'robot' ≠ 'robots'
  })

  it('first token match wins (leftmost key in token list)', () => {
    // 'cats' appears before 'robots' in input → both could match, first key found in PRESET_THEMES wins
    // PRESET_THEMES order: dinosaurs, space, ocean, jungle, unicorns, robots, cats
    // Input tokens: ['robots', 'cats'] → 'robots' key is earlier in PRESET_THEMES
    expect(resolveTheme('robots cats').key).toBe('robots')
  })

  it('punctuation stripped before matching', () => {
    expect(resolveTheme('cats!').key).toBe('cats')
    expect(resolveTheme('ocean-world').key).toBe('ocean')
  })

  it('returns a complete Theme object', () => {
    const theme = resolveTheme('space')
    expect(theme).toHaveProperty('key')
    expect(theme).toHaveProperty('shortFeedback')
    expect(theme).toHaveProperty('celebrationLine')
    expect(theme).toHaveProperty('dotEmoji')
  })
})
