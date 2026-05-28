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
 *   ≥ 5  → stage 1 (baby)
 *   ≥ 10 → stage 2 (adult)
 *   > 20 → stage 3 (legend)
 *
 * Companion unlock milestones — 1 new companion at levels 5, 10, 15;
 * all remaining companions at level 20. Idempotent: already-owned
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
    highestUnlockedLevel > 20 ? 3
    : highestUnlockedLevel >= 10 ? 2
    : highestUnlockedLevel >= 5 ? 1
    : 0

  // Build the ordered list of companions that can be unlocked (excluding the active theme)
  const unlockOrder = COMPANION_UNLOCK_ORDER.filter(k => k !== themeKey)
  const owned = new Set(unlockedCompanions)

  // Compute how many companions should be unlocked by now.
  // Milestones 5 / 10 / 15: +1 each.  Milestone 20: all remaining.
  let expectedCount = 0
  if (highestUnlockedLevel >= 20) {
    expectedCount = unlockOrder.length // unlock everything at the final milestone
  } else if (highestUnlockedLevel >= 15) {
    expectedCount = 3
  } else if (highestUnlockedLevel >= 10) {
    expectedCount = 2
  } else if (highestUnlockedLevel >= 5) {
    expectedCount = 1
  }

  const shouldOwn = unlockOrder.slice(0, expectedCount)
  const newlyUnlocked = shouldOwn.filter(k => !owned.has(k))

  return { stage, newlyUnlocked }
}
