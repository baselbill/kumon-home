// Theme definitions for the adaptive imagination layer.
// Each theme gives a child their own "world" to count and calculate in.
// Visual layer works for non-readers (emoji only); narration layer adds text for readers.

export interface ThemeLocation {
  name: string                  // "Egg Valley"
  levelRange: [number, number]  // [1, 5] — inclusive
  storyHook: string             // shown on level-complete within this tier
  icon: string                  // emoji for the location
}

export interface Theme {
  key: string
  label: string
  mascot: string           // emoji used as the mascot character
  dotEmoji: string         // emoji used instead of filled circles in DotsDisplay
  plural: string           // "dinosaurs" — for narration templates
  noun: string             // "dinosaur" — singular
  celebrationLine: string  // shown on session-complete and all-done screens
  /** Short inline feedback shown after a correct answer in the game screen */
  shortFeedback: string
  soundStyle: 'roar' | 'laser' | 'splash' | 'chime' | 'pop'
  locations: ThemeLocation[]   // exactly 4, covering levels 1–20
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
    shortFeedback: 'RAWR!',
    soundStyle: 'roar',
    locations: [
      { name: 'Egg Valley', levelRange: [1, 5], icon: '🥚', storyHook: 'You crack the egg! A tiny dinosaur blinks up at you. 🥚' },
      { name: 'Fern Forest', levelRange: [6, 10], icon: '🌿', storyHook: 'Tall ferns part before you as you stomp deeper in. 🌿' },
      { name: 'Lava Plateau', levelRange: [11, 15], icon: '🌋', storyHook: 'The volcano rumbles — your dinosaur roars right back! 🌋' },
      { name: 'Dino Peak', levelRange: [16, 20], icon: '⛰️', storyHook: 'You stand at the peak of the world. All dinosaurs cheer! ⛰️' },
    ],
  },
  {
    key: 'space',
    label: 'Space',
    mascot: '🚀',
    dotEmoji: '⭐',
    plural: 'stars',
    noun: 'star',
    celebrationLine: "You're a star! 🚀",
    shortFeedback: 'Zoom!',
    soundStyle: 'laser',
    locations: [
      { name: 'Launch Pad', levelRange: [1, 5], icon: '🛸', storyHook: '10… 9… 8… BLAST OFF! The stars are waiting! 🚀' },
      { name: 'Asteroid Belt', levelRange: [6, 10], icon: '☄️', storyHook: 'You loop through the asteroids without a scratch! ☄️' },
      { name: 'Nebula Drift', levelRange: [11, 15], icon: '🌌', storyHook: 'Colours pour past the windows — you\'re deep in space! 🌌' },
      { name: 'Starfall Station', levelRange: [16, 20], icon: '🌟', storyHook: 'The whole galaxy sparkles around you. You made it! 🌟' },
    ],
  },
  {
    key: 'ocean',
    label: 'Ocean',
    mascot: '🐬',
    dotEmoji: '🐠',
    plural: 'fish',
    noun: 'fish',
    celebrationLine: 'Splashing through math! 🐬',
    shortFeedback: 'Splash!',
    soundStyle: 'splash',
    locations: [
      { name: 'Sunny Shallows', levelRange: [1, 5], icon: '🏖️', storyHook: 'Tiny fish dart past your fins as you dive in! 🐠' },
      { name: 'Coral Kingdom', levelRange: [6, 10], icon: '🪸', storyHook: 'Coral towers stretch up like a colourful underwater city! 🪸' },
      { name: 'Midnight Trench', levelRange: [11, 15], icon: '🌊', storyHook: 'It\'s dark and glittery and magical down here! 🌊' },
      { name: 'Pearl Grotto', levelRange: [16, 20], icon: '🐚', storyHook: 'You find the pearl the ocean has been hiding! 🐚' },
    ],
  },
  {
    key: 'jungle',
    label: 'Jungle',
    mascot: '🐒',
    dotEmoji: '🍌',
    plural: 'bananas',
    noun: 'banana',
    celebrationLine: 'Monkey math genius! 🐒',
    shortFeedback: 'Bananas!',
    soundStyle: 'roar',
    locations: [
      { name: 'River Camp', levelRange: [1, 5], icon: '🌴', storyHook: 'The jungle hums with sounds. Your adventure begins! 🌴' },
      { name: 'Treetop Village', levelRange: [6, 10], icon: '🌳', storyHook: 'You leap into the treetops and can see for miles! 🌳' },
      { name: 'Mist Valley', levelRange: [11, 15], icon: '🌿', storyHook: 'Mist swirls around giant leaves as you push forward! 🌿' },
      { name: 'Golden Canopy', levelRange: [16, 20], icon: '✨', storyHook: 'You burst through the canopy into golden sunlight! ✨' },
    ],
  },
  {
    key: 'unicorns',
    label: 'Unicorns',
    mascot: '🦄',
    dotEmoji: '✨',
    plural: 'sparkles',
    noun: 'sparkle',
    celebrationLine: 'Pure magic! 🦄',
    shortFeedback: 'Magic!',
    soundStyle: 'chime',
    locations: [
      { name: 'Sparkle Meadow', levelRange: [1, 5], icon: '🌸', storyHook: 'Flowers light up where you step. Magic is real! 🌸' },
      { name: 'Rainbow Bridge', levelRange: [6, 10], icon: '🌈', storyHook: 'You gallop across the rainbow, hooves sparkling! 🌈' },
      { name: 'Crystal Cavern', levelRange: [11, 15], icon: '💎', storyHook: 'Crystals hum with ancient unicorn magic all around you! 💎' },
      { name: 'Moonrise Summit', levelRange: [16, 20], icon: '🌙', storyHook: 'A moonbeam crowns your horn. You are legendary! 🌙' },
    ],
  },
  {
    key: 'robots',
    label: 'Robots',
    mascot: '🤖',
    dotEmoji: '⚙️',
    plural: 'gears',
    noun: 'gear',
    celebrationLine: 'System: AMAZING! 🤖',
    shortFeedback: 'BEEP BOOP!',
    soundStyle: 'laser',
    locations: [
      { name: 'Assembly Bay', levelRange: [1, 5], icon: '⚙️', storyHook: 'Systems online! All gears turning! Let\'s go! ⚙️' },
      { name: 'Circuit City', levelRange: [6, 10], icon: '🔌', storyHook: 'A million lights blink in perfect patterns! 🔌' },
      { name: 'Code Sector', levelRange: [11, 15], icon: '💻', storyHook: 'Processing power: MAXIMUM. You can do anything! 💻' },
      { name: 'Mainframe Core', levelRange: [16, 20], icon: '🤖', storyHook: 'CORE UNLOCKED. You are the greatest robot ever built! 🤖' },
    ],
  },
  {
    key: 'cats',
    label: 'Cats',
    mascot: '😺',
    dotEmoji: '🐾',
    plural: 'paw prints',
    noun: 'paw print',
    celebrationLine: 'Purrfect! 😺',
    shortFeedback: 'Purr!',
    soundStyle: 'pop',
    locations: [
      { name: 'Sunny Windowsill', levelRange: [1, 5], icon: '🪟', storyHook: 'You find the perfect sunny spot and stretch out! 😺' },
      { name: 'Garden Rooftop', levelRange: [6, 10], icon: '🏡', storyHook: 'You leap from roof to roof without looking down! 🏡' },
      { name: 'Night Alley', levelRange: [11, 15], icon: '🌙', storyHook: 'The night belongs to you. Every shadow is yours! 🌙' },
      { name: 'Ancient Tower', levelRange: [16, 20], icon: '🗼', storyHook: 'You claim the tower! Cats will tell of this day! 🗼' },
    ],
  },
]

/**
 * Return the ThemeLocation that covers the given level ID.
 * Falls back to the first location if the level is out of range.
 */
export function getLocationForLevel(theme: Theme, levelId: number): ThemeLocation {
  return (
    theme.locations.find(
      loc => levelId >= loc.levelRange[0] && levelId <= loc.levelRange[1]
    ) ?? theme.locations[0]
  )
}

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
