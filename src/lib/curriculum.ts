// Kumon-style curriculum with progressive levels
// Each level builds on the previous one, following mastery-based progression

export type LevelType =
  | 'counting'      // Count dots shown on screen
  | 'addition'      // a + b = ?
  | 'subtraction'   // a - b = ?
  | 'mixed'         // mix of addition and subtraction

export interface Level {
  id: number
  name: string
  description: string
  icon: string
  type: LevelType
  maxAnswer: number       // largest possible answer
  maxOperand: number      // largest number in a problem
  showDots: boolean       // show visual dot helpers
  problemsPerSession: number
  masteryThreshold: number  // 0–1, fraction of correct needed to advance
  color: string           // UI accent colour for this level
  unlockMessage: string   // message shown when level is unlocked
}

export const CURRICULUM: Level[] = [
  {
    id: 1,
    name: 'Count to 5',
    description: 'Count the dots!',
    icon: '🐣',
    type: 'counting',
    maxAnswer: 5,
    maxOperand: 5,
    showDots: true,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#22C55E',
    unlockMessage: 'You can count to 5! Amazing!',
  },
  {
    id: 2,
    name: 'Count to 10',
    description: 'Count the dots up to 10!',
    icon: '🐥',
    type: 'counting',
    maxAnswer: 10,
    maxOperand: 10,
    showDots: true,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#3B82F6',
    unlockMessage: 'You can count to 10! Keep going!',
  },
  {
    id: 3,
    name: 'Add to 5',
    description: 'Add two small numbers!',
    icon: '🐇',
    type: 'addition',
    maxAnswer: 5,
    maxOperand: 4,
    showDots: true,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#F97316',
    unlockMessage: 'You can add to 5! Incredible!',
  },
  {
    id: 4,
    name: 'Add to 10',
    description: 'Add numbers up to 10!',
    icon: '🦊',
    type: 'addition',
    maxAnswer: 10,
    maxOperand: 9,
    showDots: true,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#8B5CF6',
    unlockMessage: "Adding to 10 is easy for you!",
  },
  {
    id: 5,
    name: 'Add to 10 (fast!)',
    description: 'Add to 10 without dots!',
    icon: '🦁',
    type: 'addition',
    maxAnswer: 10,
    maxOperand: 9,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#FBBF24',
    unlockMessage: 'Super fast adding! You rock!',
  },
  {
    id: 6,
    name: 'Add to 20',
    description: 'Add bigger numbers!',
    icon: '🐯',
    type: 'addition',
    maxAnswer: 20,
    maxOperand: 19,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#EC4899',
    unlockMessage: 'Adding to 20! You are a math star!',
  },
  {
    id: 7,
    name: 'Subtract from 5',
    description: 'Take away from small numbers!',
    icon: '🐸',
    type: 'subtraction',
    maxAnswer: 5,
    maxOperand: 5,
    showDots: true,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#14B8A6',
    unlockMessage: 'Subtraction from 5 — nailed it!',
  },
  {
    id: 8,
    name: 'Subtract from 10',
    description: 'Take away from 10!',
    icon: '🦋',
    type: 'subtraction',
    maxAnswer: 10,
    maxOperand: 10,
    showDots: true,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#6366F1',
    unlockMessage: 'Subtraction hero! Amazing work!',
  },
  {
    id: 9,
    name: 'Subtract from 20',
    description: 'Take away from bigger numbers!',
    icon: '🦅',
    type: 'subtraction',
    maxAnswer: 20,
    maxOperand: 20,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#EF4444',
    unlockMessage: 'Subtracting from 20! Wow!',
  },
  {
    id: 10,
    name: 'Math Master',
    description: 'Mix of adding and taking away!',
    icon: '🏆',
    type: 'mixed',
    maxAnswer: 20,
    maxOperand: 20,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#F59E0B',
    unlockMessage: 'YOU ARE A MATH MASTER! 🏆',
  },
]

export function getLevelById(id: number): Level | undefined {
  return CURRICULUM.find((l) => l.id === id)
}

export const TOTAL_LEVELS = CURRICULUM.length
