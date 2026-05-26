import { Level, LevelType } from './curriculum'

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

function generateSubtraction(level: Level): Problem {
  let a: number, b: number
  let attempts = 0
  do {
    a = randInt(2, level.maxOperand)
    b = randInt(1, a - 1)  // ensure positive result, no zero answers
    attempts++
  } while (a > level.maxOperand && attempts < 100)

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
 * Generate a full session of problems for a level.
 * We shuffle so the same numbers don't appear consecutively.
 */
export function generateSession(level: Level): Problem[] {
  const problems: Problem[] = []
  for (let i = 0; i < level.problemsPerSession; i++) {
    problems.push(generateProblem(level))
  }
  return problems
}

/** Format a problem as a human-readable string, e.g. "3 + 4 = ?" */
export function formatProblem(p: Problem): string {
  if (p.type === 'counting') {
    return 'How many?'
  }
  return `${p.operand1} ${p.operator} ${p.operand2} =`
}
