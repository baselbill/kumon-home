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

const SAVE_KEY = 'kumon_home_v1'

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

// Update streak based on today's date
export function updateStreak(save: GameSave): GameSave {
  const today = new Date().toISOString().slice(0, 10)
  if (save.lastPlayDate === today) {
    // Already played today — streak unchanged
    return save
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const newStreak = save.lastPlayDate === yesterday ? save.streak + 1 : 1
  return { ...save, streak: newStreak, lastPlayDate: today }
}

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
    description: 'Completed all 10 levels!',
    icon: '🏆',
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
  check('sessions_10', save.totalSessionsPlayed >= 10)

  return newOnes
}
