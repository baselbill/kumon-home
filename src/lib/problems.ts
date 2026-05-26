import { Level, LevelType } from './curriculum'
import type { Theme } from './themes'
import type { AdaptiveState } from './storage'

export interface Problem {
  id: string
  type: LevelType
  operand1: number
  operand2: number | null   // null for counting problems
  operator: '+' | '-' | null
  answer: number
  showDots: boolean
}

// Generate a random integer between min and max (inclusive)
function randInt(min: number, max: number): number {
  if (max < min) return min
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateCounting(level: Level): Problem {
  const num = randInt(1, level.maxOperand)
  return {
    id: Math.random().toString(36).slice(2),
    type: 'counting',
    operand1: num,
    operand2: null,
    operator: null,
    answer: num,
    showDots: true,
  }
}

function generateAddition(level: Level): Problem {
  let a: number, b: number
  let attempts = 0
  do {
    a = randInt(1, level.maxOperand - 1)
    b = randInt(1, level.maxOperand - a)
    attempts++
  } while (a + b > level.maxAnswer && attempts < 100)

  return {
    id: Math.random().toString(36).slice(2),
    type: 'addition',
    operand1: a,
    operand2: b,
    operator: '+',
    answer: a + b,
    showDots: level.showDots,
  }
}

/**
 * Generate a subtraction problem.
 * Bug fix: the original while-loop condition (a > level.maxOperand) was always
 * false since a = randInt(2, maxOperand). Removed the dead loop — b < a is
 * already guaranteed by construction.
 */
function generateSubtraction(level: Level): Problem {
  const a = randInt(2, Math.max(2, level.maxOperand))
  const b = randInt(1, a - 1)  // b < a → answer > 0, answer ≠ 0

  return {
    id: Math.random().toString(36).slice(2),
    type: 'subtraction',
    operand1: a,
    operand2: b,
    operator: '-',
    answer: a - b,
    showDots: level.showDots,
  }
}

function generateMixed(level: Level): Problem {
  return Math.random() < 0.5
    ? generateAddition(level)
    : generateSubtraction(level)
}

export function generateProblem(level: Level): Problem {
  switch (level.type) {
    case 'counting':
      return generateCounting(level)
    case 'addition':
      return generateAddition(level)
    case 'subtraction':
      return generateSubtraction(level)
    case 'mixed':
      return generateMixed(level)
  }
}

/**
 * Wrap a problem in a story sentence for reader-mode profiles.
 * Critical invariant: numbers come ONLY from problem fields — never generated
 * here. The template writes words around the numbers, never produces them.
 */
export function narrate(problem: Problem, theme: Theme): string {
  if (problem.type === 'counting') {
    return `How many ${theme.plural} do you see?`
  }

  const op2 = problem.operand2 ?? 0

  if (problem.type === 'addition' || problem.operator === '+') {
    return `${problem.operand1} ${theme.plural} found ${op2} more. How many ${theme.plural} now?`
  }

  if (problem.type === 'subtraction' || problem.operator === '-') {
    return `${problem.operand1} ${theme.plural} were playing. ${op2} went home. How many ${theme.plural} are left?`
  }

  // Fallback (shouldn't be reached)
  return `${problem.operand1} ${problem.operator} ${op2} = ?`
}

/**
 * Generate a full session of problems for a level.
 *
 * Applies the AdaptiveState offset to level.maxOperand at generation time.
 * Does NOT mutate the passed Level object — the adjusted level is internal.
 *
 * Returns both the problems array and the effective showDots value (which may
 * differ from level.showDots when adaptive difficulty re-enables dot hints).
 *
 * maxAnswer cap: effectiveMaxOperand is capped at level.maxAnswer - 1 to
 * prevent impossible combinations in the generation loops.
 */
export function generateSession(
  level: Level,
  adaptive?: AdaptiveState
): { problems: Problem[]; showDots: boolean } {
  const offset = adaptive?.maxOperandOffset ?? 0

  // Cap between 2 (subtraction needs at least a=2) and maxAnswer-1
  const effectiveMaxOperand = Math.max(
    2,
    Math.min(level.maxOperand + offset, level.maxAnswer - 1)
  )

  // Re-enable dots when difficulty is reduced below the level's baseline
  const effectiveShowDots = level.showDots || offset < 0

  const effectiveLevel: Level = {
    ...level,
    maxOperand: effectiveMaxOperand,
    showDots: effectiveShowDots,
  }

  const problems: Problem[] = []
  for (let i = 0; i < level.problemsPerSession; i++) {
    problems.push(generateProblem(effectiveLevel))
  }

  return { problems, showDots: effectiveShowDots }
}

/** Format a problem as a human-readable string, e.g. "3 + 4 = ?" */
export function formatProblem(p: Problem): string {
  if (p.type === 'counting') {
    return 'How many?'
  }
  return `${p.operand1} ${p.operator} ${p.operand2} =`
}
