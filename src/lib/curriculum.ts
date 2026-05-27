// Kumon-style curriculum with progressive levels
// Each level builds on the previous one, following mastery-based progression

export type LevelType =
  | 'counting'      // Count dots shown on screen
  | 'addition'      // a + b = ?
  | 'subtraction'   // a - b = ?
  | 'mixed'         // mix of addition and subtraction
  | 'multiplication'// a × b = ?
  | 'division'      // a ÷ b = ? (whole-number quotients only)
  | 'exponent'      // a ^ b = ?
  | 'sqrt'          // √a = ? (perfect squares only)
  | 'percentage'    // a% of b = ? (multiples of 10%, whole-number answers)
  | 'algebra'       // ax = b  or  x ± a = b  (one-step, integer solution)

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
  /** Multiplication only: restrict one factor to these values (e.g. [2,5,10]).
   *  Undefined → use full 2–maxOperand range for both factors. */
  multipliers?: number[]
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
    color: '#F97316', // arc L1: orange (warm start)
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
    color: '#FB923C', // arc L2: orange-amber
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
    color: '#F59E0B', // arc L3: amber
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
    color: '#EAB308', // arc L4: yellow-amber
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
    color: '#84CC16', // arc L5: lime (warm→nature transition)
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
    color: '#22C55E', // arc L6: green
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
    color: '#10B981', // arc L7: emerald
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
    color: '#14B8A6', // arc L8: teal
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
    color: '#06B6D4', // arc L9: cyan
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
    color: '#0EA5E9', // arc L10: sky (nature→cool transition)
    unlockMessage: 'YOU ARE A MATH MASTER! 🏆',
  },

  // ── Phase 1: Multiplication & division ──────────────────────────────────────

  {
    id: 11,
    name: 'Multiply by 2, 5, 10',
    description: 'The easiest times tables!',
    icon: '⚡',
    type: 'multiplication',
    maxAnswer: 100,
    maxOperand: 10,
    multipliers: [2, 5, 10],
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#3B82F6', // arc L11: blue
    unlockMessage: 'Times tables — off to a flying start! ⚡',
  },
  {
    id: 12,
    name: 'Multiply by 3 & 4',
    description: 'More times tables!',
    icon: '🔢',
    type: 'multiplication',
    maxAnswer: 48,
    maxOperand: 12,
    multipliers: [3, 4],
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#6366F1', // arc L12: indigo
    unlockMessage: '×3 and ×4 mastered — nice work!',
  },
  {
    id: 13,
    name: 'Times Tables',
    description: 'All times tables up to 12!',
    icon: '✖️',
    type: 'multiplication',
    maxAnswer: 144,
    maxOperand: 12,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#8B5CF6', // arc L13: violet
    unlockMessage: 'Full times tables — you nailed it! 🌟',
  },
  {
    id: 14,
    name: 'Division',
    description: 'Split numbers equally!',
    icon: '➗',
    type: 'division',
    maxAnswer: 12,
    maxOperand: 12,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#7C3AED', // arc L14: purple-violet
    unlockMessage: "Division pro — you're on a roll!",
  },
  {
    id: 15,
    name: 'Bigger Multiply',
    description: 'Multiply larger numbers!',
    icon: '💥',
    type: 'multiplication',
    maxAnswer: 240,
    maxOperand: 20,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#A855F7', // arc L15: purple
    unlockMessage: 'Big multiplication — absolutely crushed it!',
  },
  {
    id: 16,
    name: 'Long Division',
    description: 'Divide bigger numbers!',
    icon: '📐',
    type: 'division',
    maxAnswer: 20,
    maxOperand: 20,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#9333EA', // arc L16: deep purple
    unlockMessage: "Long division solved! You've got this!",
  },

  // ── Phase 1: Higher concepts (integer answers) ───────────────────────────────

  {
    id: 17,
    name: 'Powers',
    description: 'Numbers raised to a power!',
    icon: '⬆️',
    type: 'exponent',
    maxAnswer: 256,
    maxOperand: 4,   // base 2–4, exponent 2–4 → max 4⁴ = 256
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#6D28D9', // arc L17: deeper violet
    unlockMessage: 'To the power of AMAZING!',
  },
  {
    id: 18,
    name: 'Square Roots',
    description: 'Find the square root!',
    icon: '√',
    type: 'sqrt',
    maxAnswer: 12,
    maxOperand: 12,  // roots 2–12 → squares 4–144
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#4C1D95', // arc L18: very deep violet
    unlockMessage: 'Square roots — rooted in success! 🌱',
  },
  {
    id: 19,
    name: 'Percentages',
    description: 'Find percentages of numbers!',
    icon: '%',
    type: 'percentage',
    maxAnswer: 100,
    maxOperand: 10,  // percent steps 10%–100% (maxOperand × 10)
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#3730A3', // arc L19: dark indigo
    unlockMessage: 'Percentage pro! Nothing can stop you!',
  },
  {
    id: 20,
    name: 'Algebra',
    description: 'Solve for the mystery number!',
    icon: '🔍',
    type: 'algebra',
    maxAnswer: 20,
    maxOperand: 10,
    showDots: false,
    problemsPerSession: 20,
    masteryThreshold: 0.9,
    color: '#1D4ED8',
    unlockMessage: 'Algebra solved! You are a true Math Wizard! 🧙',
  },
]

export function getLevelById(id: number): Level | undefined {
  return CURRICULUM.find((l) => l.id === id)
}

export const TOTAL_LEVELS = CURRICULUM.length

/**
 * Map a child's age to an appropriate starting highestUnlockedLevel.
 * Conservative by one level so the first session is a confidence builder,
 * not a wall. Ages 10+ map to level 10 (Math Master) — the full curriculum
 * is unlocked and they begin at the top.
 *
 * Age → Level
 *  ≤4 → 1  (Count to 5)
 *   5 → 2  (Count to 10)
 *   6 → 3  (Add to 5)
 *   7 → 5  (Add to 10 — fast, no dots)
 *   8 → 7  (Subtract from 5)
 *   9 → 9  (Subtract from 20)
 *  10 → 10 (Math Master)
 *  11 → 11 (Multiply by 2, 5, 10)
 *  12 → 13 (Times Tables — assumes basic ×2/5/10 known)
 *  13 → 15 (Bigger Multiply)
 *  14 → 17 (Powers)
 *  15 → 19 (Percentages)
 *  16+ → 20 (Algebra — full curriculum accessible)
 */
export function getStartingLevel(age: number): number {
  if (age <= 4) return 1
  if (age === 5) return 2
  if (age === 6) return 3
  if (age === 7) return 5
  if (age === 8) return 7
  if (age === 9) return 9
  if (age === 10) return 10
  if (age === 11) return 11
  if (age === 12) return 13
  if (age === 13) return 15
  if (age === 14) return 17
  if (age === 15) return 19
  return 20
}
