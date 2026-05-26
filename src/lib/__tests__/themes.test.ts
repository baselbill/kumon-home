import { describe, it, expect } from 'vitest'
import { PRESET_THEMES, resolveTheme } from '../themes'

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
