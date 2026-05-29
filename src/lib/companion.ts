export interface CompanionProgress {
  stage: number           // 0–3
  newlyUnlocked: string[] // theme keys unlocked this call that weren't already owned
}

// Fixed unlock order — active themeKey is skipped since it's always owned
const COMPANION_UNLOCK_ORDER = [
  'dinosaurs', 'space', 'ocean', 'jungle', 'unicorns', 'robots', 'cats',
]

/**
 * Derive companion stage and any newly unlocked companions from profile state.
 *
 * Stage thresholds (based on highestUnlockedLevel):
 *   ≥ 6  → stage 1 (baby)
 *   ≥ 11 → stage 2 (adult)
 *   > 21 → stage 3 (legend)
 *
 * Companion unlock milestones — 1 new companion at levels 6, 11, 16;
 * all remaining companions at level 21. Idempotent: already-owned
 * companions are never re-added, so calling twice with the same input
 * returns an empty newlyUnlocked list.
 */
export function computeCompanionProgress(profile: {
  highestUnlockedLevel: number
  themeKey: string
  unlockedCompanions: string[]
}): CompanionProgress {
  const { highestUnlockedLevel, themeKey, unlockedCompanions } = profile

  // Stage
  const stage =
    highestUnlockedLevel > 21 ? 3
    : highestUnlockedLevel >= 11 ? 2
    : highestUnlockedLevel >= 6 ? 1
    : 0

  // Build the ordered list of companions that can be unlocked (excluding the active theme)
  const unlockOrder = COMPANION_UNLOCK_ORDER.filter(k => k !== themeKey)
  const owned = new Set(unlockedCompanions)

  // Compute how many companions should be unlocked by now.
  // Milestones 6 / 11 / 16: +1 each.  Milestone 21: all remaining.
  let expectedCount = 0
  if (highestUnlockedLevel >= 21) {
    expectedCount = unlockOrder.length // unlock everything at the final milestone
  } else if (highestUnlockedLevel >= 16) {
    expectedCount = 3
  } else if (highestUnlockedLevel >= 11) {
    expectedCount = 2
  } else if (highestUnlockedLevel >= 6) {
    expectedCount = 1
  }

  const shouldOwn = unlockOrder.slice(0, expectedCount)
  const newlyUnlocked = shouldOwn.filter(k => !owned.has(k))

  return { stage, newlyUnlocked }
}
