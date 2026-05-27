// Persistent game state using localStorage

export interface LevelProgress {
  bestScore: number      // best correct count in one session
  totalAttempts: number  // total problems attempted ever
  totalCorrect: number   // total correct ever
  completed: boolean     // has this level been mastered?
  completedAt?: string   // ISO date when mastered
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface GameSave {
  version: number
  highestUnlockedLevel: number
  totalStars: number
  streak: number
  lastPlayDate: string | null   // ISO date string
  levelProgress: Record<number, LevelProgress>
  achievements: string[]        // achievement IDs earned
  totalSessionsPlayed: number
  totalProblemsAnswered: number
  totalCorrectAnswers: number
}

// ─────────────────────────────────────────────────────────────
// Adaptive difficulty state — stored per profile per level
// ─────────────────────────────────────────────────────────────

export interface AdaptiveState {
  /** Additive offset on Level.maxOperand. Default 0, range [-2, +3]. */
  maxOperandOffset: number
  /** ISO timestamp of last session that updated this state. */
  lastUpdated: string
}

// ─────────────────────────────────────────────────────────────
// Multi-profile save
// ─────────────────────────────────────────────────────────────

export interface ProfileSave extends GameSave {
  profileId: string
  profileName: string
  themeKey: string       // key matching a Theme in PRESET_THEMES
  readerMode: boolean    // true → show story sentences wrapping problems
  adaptiveState: Record<number, AdaptiveState>  // keyed by level ID
}

const SAVE_KEY = 'kumon_home_v1'
const PROFILES_KEY = 'kumon_profiles_v1'
const ACTIVE_PROFILE_KEY = 'kumon_active_profile'

const DEFAULT_SAVE: GameSave = {
  version: 1,
  highestUnlockedLevel: 1,
  totalStars: 0,
  streak: 0,
  lastPlayDate: null,
  levelProgress: {},
  achievements: [],
  totalSessionsPlayed: 0,
  totalProblemsAnswered: 0,
  totalCorrectAnswers: 0,
}

// ─── Legacy single-profile API (kept for reference; superceded by profiles) ───

export function loadGame(): GameSave {
  if (typeof window === 'undefined') return { ...DEFAULT_SAVE }
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return { ...DEFAULT_SAVE }
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SAVE }
  }
}

export function saveGame(state: GameSave): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    // storage full or private browsing — silently ignore
  }
}

export function resetGame(): GameSave {
  const fresh = { ...DEFAULT_SAVE }
  saveGame(fresh)
  return fresh
}

// ─── Multi-profile API ────────────────────────────────────────

/**
 * Load all profiles from localStorage.
 * Migration: if no profiles exist yet but an old single-profile save does,
 * wrap it as profiles[0]. `highestUnlockedLevel` is copied verbatim — it may
 * be 11 (all-levels-done sentinel) and must NOT be clamped.
 */
export function loadProfiles(): ProfileSave[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (raw) {
      const parsed: ProfileSave[] = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }

    // Migration path: existing single-profile save → profiles[0]
    const legacy = localStorage.getItem(SAVE_KEY)
    if (legacy) {
      const parsed = JSON.parse(legacy)
      const migrated: ProfileSave = {
        ...DEFAULT_SAVE,
        ...parsed,
        profileId: 'profile-legacy',
        profileName: 'Player',
        themeKey: 'dinosaurs',
        readerMode: false,
        adaptiveState: {},
      }
      saveProfiles([migrated])
      return [migrated]
    }

    return []
  } catch {
    return []
  }
}

export function saveProfiles(profiles: ProfileSave[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  } catch {
    // storage full or private browsing — silently ignore
  }
}

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_PROFILE_KEY)
}

export function setActiveProfileId(id: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id)
  } catch {
    // silently ignore
  }
}

/**
 * Create a fresh ProfileSave with sane defaults.
 *
 * @param startingLevel  highestUnlockedLevel to begin at (default 1).
 *   Pass getStartingLevel(age) from curriculum.ts to give age-appropriate access.
 *   Levels below startingLevel are automatically accessible on first play.
 */
export function createProfile(
  name: string,
  themeKey: string,
  readerMode: boolean,
  startingLevel = 1
): ProfileSave {
  return {
    ...DEFAULT_SAVE,
    highestUnlockedLevel: Math.max(1, startingLevel),
    profileId: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    profileName: name,
    themeKey,
    readerMode,
    adaptiveState: {},
  }
}

// ─── Streak ───────────────────────────────────────────────────

/** Update streak based on today's date. Generic so it works with ProfileSave too. */
export function updateStreak<T extends GameSave>(save: T): T {
  const today = new Date().toISOString().slice(0, 10)
  if (save.lastPlayDate === today) {
    // Already played today — streak unchanged
    return save
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const newStreak = save.lastPlayDate === yesterday ? save.streak + 1 : 1
  return { ...save, streak: newStreak, lastPlayDate: today }
}

// ─── Achievements ─────────────────────────────────────────────

// All possible achievements
export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_correct',
    name: 'First Star!',
    description: 'Got your very first answer right',
    icon: '⭐',
  },
  {
    id: 'first_session',
    name: 'Getting Started',
    description: 'Completed your first practice session',
    icon: '🎯',
  },
  {
    id: 'first_level',
    name: 'Level Up!',
    description: 'Mastered your first level',
    icon: '🎉',
  },
  {
    id: 'perfect_session',
    name: 'Perfect!',
    description: 'Got every question right in a session',
    icon: '💎',
  },
  {
    id: 'streak_3',
    name: 'On a Roll!',
    description: 'Practised 3 days in a row',
    icon: '🔥',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Practised 7 days in a row',
    icon: '🌟',
  },
  {
    id: 'stars_50',
    name: 'Star Collector',
    description: 'Earned 50 stars',
    icon: '✨',
  },
  {
    id: 'stars_200',
    name: 'Star Galaxy',
    description: 'Earned 200 stars',
    icon: '🌌',
  },
  {
    id: 'level_5',
    name: 'Halfway Hero',
    description: 'Reached level 5',
    icon: '🦁',
  },
  {
    id: 'level_10',
    name: 'Math Master',
    description: 'Reached level 10!',
    icon: '🏆',
  },
  {
    id: 'level_20',
    name: 'Math Wizard',
    description: 'Completed all 20 levels!',
    icon: '🧙',
  },
  {
    id: 'sessions_10',
    name: 'Dedicated Learner',
    description: 'Completed 10 practice sessions',
    icon: '📚',
  },
]

export function checkNewAchievements(save: GameSave): string[] {
  const earned = new Set(save.achievements)
  const newOnes: string[] = []

  const check = (id: string, condition: boolean) => {
    if (!earned.has(id) && condition) newOnes.push(id)
  }

  check('first_correct', save.totalCorrectAnswers >= 1)
  check('first_session', save.totalSessionsPlayed >= 1)
  check('first_level', save.highestUnlockedLevel >= 2)
  check('streak_3', save.streak >= 3)
  check('streak_7', save.streak >= 7)
  check('stars_50', save.totalStars >= 50)
  check('stars_200', save.totalStars >= 200)
  check('level_5', save.highestUnlockedLevel >= 5)
  check('level_10', save.highestUnlockedLevel > 10)
  check('level_20', save.highestUnlockedLevel > 20)
  check('sessions_10', save.totalSessionsPlayed >= 10)

  return newOnes
}
