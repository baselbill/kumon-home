import { Level, LevelType } from './curriculum'
import type { Theme } from './themes'
import type { AdaptiveState } from './storage'

export interface Problem {
  id: string
  type: LevelType
  operand1: number
  operand2: number | null   // null for counting / sqrt problems
  operator: '+' | '-' | '×' | '÷' | '^' | '√' | '%' | null
  answer: number
  showDots: boolean
  /** Pre-computed display string for problem types with non-standard layouts
   *  (e.g. algebra: "3x = 12"). When set, GameScreen renders this instead of
   *  the default operand/operator layout. */
  displayText?: string
}

// Generate a random integer between min and max (inclusive)
function randInt(min: number, max: number): number {
  if (max < min) return min
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeId(): string {
  return Math.random().toString(36).slice(2)
}

// ── Existing generators ──────────────────────────────────────────────────────

function generateCounting(level: Level): Problem {
  const num = randInt(1, level.maxOperand)
  return {
    id: makeId(),
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
    id: makeId(),
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
    id: makeId(),
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

// ── Phase 1 generators ───────────────────────────────────────────────────────

/**
 * Multiplication problem.
 * If level.multipliers is set, one factor is drawn from that list;
 * the other ranges 1–maxOperand. This lets early levels (L11: ×2/5/10,
 * L12: ×3/4) restrict the multiplier while still varying the other factor.
 */
function generateMultiplication(level: Level): Problem {
  let a: number, b: number

  if (level.multipliers && level.multipliers.length > 0) {
    a = randInt(1, level.maxOperand)
    b = level.multipliers[Math.floor(Math.random() * level.multipliers.length)]
  } else {
    a = randInt(2, level.maxOperand)
    b = randInt(2, level.maxOperand)
  }

  // Swap occasionally so the multiplier appears on either side
  if (Math.random() < 0.5) { const t = a; a = b; b = t }

  return {
    id: makeId(),
    type: 'multiplication',
    operand1: a,
    operand2: b,
    operator: '×',
    answer: a * b,
    showDots: false,
  }
}

/**
 * Division problem — always produces a whole-number quotient.
 * Strategy: pick quotient and divisor, derive dividend.
 * maxOperand controls the max quotient (the answer).
 */
function generateDivision(level: Level): Problem {
  const quotient = randInt(2, level.maxOperand)
  const divisor  = randInt(2, Math.min(level.maxOperand, 12))
  const dividend = quotient * divisor

  return {
    id: makeId(),
    type: 'division',
    operand1: dividend,
    operand2: divisor,
    operator: '÷',
    answer: quotient,
    showDots: false,
  }
}

/**
 * Exponent problem — base 2–maxOperand, exponent 2–maxOperand.
 * Retries if result exceeds maxAnswer (e.g. 4^5 = 1024 on L17 where cap is 256).
 */
function generateExponent(level: Level, attempt = 0): Problem {
  const base = randInt(2, Math.min(level.maxOperand, 10))
  const exp  = randInt(2, Math.min(level.maxOperand, 4))
  const answer = Math.pow(base, exp)

  if (answer > level.maxAnswer && attempt < 20) {
    return generateExponent(level, attempt + 1)
  }

  return {
    id: makeId(),
    type: 'exponent',
    operand1: base,
    operand2: exp,
    operator: '^',
    answer: Math.round(answer),
    showDots: false,
  }
}

/**
 * Square root problem — picks a random root r in [2, maxOperand],
 * then asks for √(r²). Guarantees a clean integer answer.
 */
function generateSqrt(level: Level): Problem {
  const root = randInt(2, level.maxOperand)
  return {
    id: makeId(),
    type: 'sqrt',
    operand1: root * root,
    operand2: null,
    operator: '√',
    answer: root,
    showDots: false,
  }
}

/**
 * Percentage problem — both percent and value are multiples of 10,
 * guaranteeing a whole-number answer.
 *   percent = p × 10  (p ∈ [1, maxOperand])
 *   value   = v × 10  (v ∈ [1, 10])
 *   answer  = p × v
 */
function generatePercentage(level: Level): Problem {
  const p       = randInt(1, Math.min(level.maxOperand, 10))
  const v       = randInt(1, 10)
  const percent = p * 10
  const value   = v * 10
  return {
    id: makeId(),
    type: 'percentage',
    operand1: percent,
    operand2: value,
    operator: '%',
    answer: p * v,
    showDots: false,
  }
}

/**
 * One-step algebra problem. Three forms chosen with equal probability:
 *   ax = b  →  displayText: "3x = 12",    answer = b / a
 *   x + a = b →  displayText: "x + 7 = 15", answer = b − a
 *   x − a = b →  displayText: "x − 3 = 5",  answer = b + a
 *
 * maxOperand caps the mystery value (x) to keep answers manageable.
 * The operator field records the equation form (×, +, −) for narrate().
 */
function generateAlgebra(level: Level): Problem {
  const form = randInt(0, 2)  // 0 = coeff, 1 = add, 2 = sub
  const maxX = level.maxOperand

  if (form === 0) {
    // ax = b
    const coeff = randInt(2, Math.min(maxX, 9))
    const x     = randInt(2, maxX)
    const rhs   = coeff * x
    return {
      id: makeId(),
      type: 'algebra',
      operand1: coeff,
      operand2: rhs,
      operator: '×',
      answer: x,
      showDots: false,
      displayText: `${coeff}x = ${rhs}`,
    }
  } else if (form === 1) {
    // x + a = b
    const x = randInt(2, maxX)
    const a = randInt(1, Math.max(1, maxX - 1))
    const b = x + a
    return {
      id: makeId(),
      type: 'algebra',
      operand1: a,
      operand2: b,
      operator: '+',
      answer: x,
      showDots: false,
      displayText: `x + ${a} = ${b}`,
    }
  } else {
    // x − a = b
    const x = randInt(3, maxX + 2)
    const a = randInt(1, x - 2)
    const b = x - a
    return {
      id: makeId(),
      type: 'algebra',
      operand1: a,
      operand2: b,
      operator: '-',
      answer: x,
      showDots: false,
      displayText: `x − ${a} = ${b}`,
    }
  }
}

// ── Dispatch ─────────────────────────────────────────────────────────────────

export function generateProblem(level: Level): Problem {
  switch (level.type) {
    case 'counting':        return generateCounting(level)
    case 'addition':        return generateAddition(level)
    case 'subtraction':     return generateSubtraction(level)
    case 'mixed':           return generateMixed(level)
    case 'multiplication':  return generateMultiplication(level)
    case 'division':        return generateDivision(level)
    case 'exponent':        return generateExponent(level)
    case 'sqrt':            return generateSqrt(level)
    case 'percentage':      return generatePercentage(level)
    case 'algebra':         return generateAlgebra(level)
    default:
      // Exhaustiveness guard — satisfies TypeScript if new types are added
      // but the switch is not updated.
      return generateAddition(level)
  }
}

// ── Narration ────────────────────────────────────────────────────────────────

/**
 * Wrap a problem in a story sentence for reader-mode profiles.
 * Critical invariant: numbers come ONLY from problem fields — never generated
 * here. The template writes words around the numbers, never produces them.
 *
 * type is checked first to prevent operator-based fallthrough for new types
 * (e.g. algebra with operator='+' must not render as an addition narration).
 */
export function narrate(problem: Problem, theme: Theme): string {
  const op2 = problem.operand2 ?? 0

  switch (problem.type) {
    case 'counting':
      return `How many ${theme.plural} do you see?`

    case 'addition':
      return `${problem.operand1} ${theme.plural} found ${op2} more. How many ${theme.plural} now?`

    case 'subtraction':
      return `${problem.operand1} ${theme.plural} were playing. ${op2} went home. How many ${theme.plural} are left?`

    case 'mixed':
      // mixed delegates to addition or subtraction based on the operator
      return problem.operator === '+'
        ? `${problem.operand1} ${theme.plural} found ${op2} more. How many ${theme.plural} now?`
        : `${problem.operand1} ${theme.plural} were playing. ${op2} went home. How many ${theme.plural} are left?`

    case 'multiplication':
      return `You have ${problem.operand1} groups of ${op2} ${theme.plural}. How many ${theme.plural} altogether?`

    case 'division':
      return `${problem.operand1} ${theme.plural} split into ${op2} equal groups. How many in each group?`

    case 'exponent':
      return `What is ${problem.operand1} to the power of ${op2}?`

    case 'sqrt':
      return `What number times itself equals ${problem.operand1}?`

    case 'percentage':
      return `What is ${problem.operand1}% of ${op2}?`

    case 'algebra':
      return problem.displayText
        ? `Solve: ${problem.displayText} — what is x?`
        : `Find the mystery number.`

    default:
      return `${problem.operand1} ${problem.operator} ${op2} = ?`
  }
}

// ── Session generation ────────────────────────────────────────────────────────

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
  if (p.type === 'counting') return 'How many?'
  if (p.displayText)         return `${p.displayText} =`
  if (p.type === 'sqrt')     return `√${p.operand1} =`
  return `${p.operand1} ${p.operator} ${p.operand2} =`
}
