// Theme definitions for the adaptive imagination layer.
// Each theme gives a child their own "world" to count and calculate in.
// Visual layer works for non-readers (emoji only); narration layer adds text for readers.

export interface Theme {
  key: string
  label: string
  mascot: string           // emoji used as the mascot character
  dotEmoji: string         // emoji used instead of filled circles in DotsDisplay
  plural: string           // "dinosaurs" — for narration templates
  noun: string             // "dinosaur" — singular
  celebrationLine: string  // shown on session-complete and all-done screens
  soundStyle: 'roar' | 'laser' | 'splash' | 'chime' | 'pop'
}

export const PRESET_THEMES: Theme[] = [
  {
    key: 'dinosaurs',
    label: 'Dinosaurs',
    mascot: '🦕',
    dotEmoji: '🦕',
    plural: 'dinosaurs',
    noun: 'dinosaur',
    celebrationLine: 'Your dinosaurs are SO proud! 🦕',
    soundStyle: 'roar',
  },
  {
    key: 'space',
    label: 'Space',
    mascot: '🚀',
    dotEmoji: '⭐',
    plural: 'stars',
    noun: 'star',
    celebrationLine: "You're a star! 🚀",
    soundStyle: 'laser',
  },
  {
    key: 'ocean',
    label: 'Ocean',
    mascot: '🐬',
    dotEmoji: '🐠',
    plural: 'fish',
    noun: 'fish',
    celebrationLine: 'Splashing through math! 🐬',
    soundStyle: 'splash',
  },
  {
    key: 'jungle',
    label: 'Jungle',
    mascot: '🐒',
    dotEmoji: '🍌',
    plural: 'bananas',
    noun: 'banana',
    celebrationLine: 'Monkey math genius! 🐒',
    soundStyle: 'roar',
  },
  {
    key: 'unicorns',
    label: 'Unicorns',
    mascot: '🦄',
    dotEmoji: '✨',
    plural: 'sparkles',
    noun: 'sparkle',
    celebrationLine: 'Pure magic! 🦄',
    soundStyle: 'chime',
  },
  {
    key: 'robots',
    label: 'Robots',
    mascot: '🤖',
    dotEmoji: '⚙️',
    plural: 'gears',
    noun: 'gear',
    celebrationLine: 'System: AMAZING! 🤖',
    soundStyle: 'laser',
  },
  {
    key: 'cats',
    label: 'Cats',
    mascot: '😺',
    dotEmoji: '🐾',
    plural: 'paw prints',
    noun: 'paw print',
    celebrationLine: 'Purrfect! 😺',
    soundStyle: 'pop',
  },
]

/**
 * Resolve a free-text string to the closest preset theme.
 * Algorithm: lowercase the input, split on non-alpha chars, return the first
 * PRESET_THEMES entry whose key appears anywhere in the token list.
 * e.g. "ninja cats" → tokens ["ninja","cats"] → matches "cats" → cats theme.
 * Falls back to dinosaurs (index 0) if no match.
 */
export function resolveTheme(input: string): Theme {
  const tokens = input
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return PRESET_THEMES.find((t) => tokens.includes(t.key)) ?? PRESET_THEMES[0]
}
