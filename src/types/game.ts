import { Problem } from '@/lib/problems'

export type Screen =
  | 'home' | 'level-select' | 'achievements' | 'playing' | 'lesson-intro'
  | 'session-complete' | 'level-complete' | 'world' | 'shop'
  | 'parent-pin' | 'parent-pin-set' | 'parent-dashboard' | 'parent-progress' | 'parent-settings'
export type SubScreen = 'none' | 'achievements' | 'profile-create' | 'profile-edit'
export type FeedbackState = 'none' | 'correct' | 'wrong'

export interface ProblemAttempt {
  problemIndex: number
  correct: boolean
  responseTimeMs: number
  operand1: number
  operand2: number | null
  operator: Problem['operator']
}

export interface SessionResult {
  levelId: number
  correct: number
  total: number
  mastered: boolean
  isPerfect: boolean
  starsEarned: number
  newAchievements: string[]
  adaptiveBanner: boolean  // show "Level Up?" hint (only when mastery NOT triggered)
  durationMs: number       // total session wall-clock time
  avgResponseMs: number    // mean response time across all attempts
}

export interface FloatingStar { id: number; x: number; y: number }
