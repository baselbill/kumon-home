import { describe, it, expect } from 'vitest'
import { narrate, generateSession, generateProblem } from '../problems'
import type { Problem } from '../problems'
import type { Level } from '../curriculum'
import { CURRICULUM } from '../curriculum'
import type { Theme } from '../themes'
import { PRESET_THEMES } from '../themes'
import type { AdaptiveState } from '../storage'

// ── Helpers ──────────────────────────────────────────────────────────────────

const dino = PRESET_THEMES[0]  // dinosaurs
const space = PRESET_THEMES[1] // space

function makeAdditionProblem(a: number, b: number): Problem {
  return {
    id: 'test',
    type: 'addition',
    operand1: a,
    operand2: b,
    operator: '+',
    answer: a + b,
    showDots: false,
  }
}

function makeSubtractionProblem(a: number, b: number): Problem {
  return {
    id: 'test',
    type: 'subtraction',
    operand1: a,
    operand2: b,
    operator: '-',
    answer: a - b,
    showDots: false,
  }
}

function makeCountingProblem(n: number): Problem {
  return {
    id: 'test',
    type: 'counting',
    operand1: n,
    operand2: null,
    operator: null,
    answer: n,
    showDots: true,
  }
}

// Level with showDots = false (for adaptive showDots tests)
const levelNoDotsAdd: Level = {
  id: 5,
  name: 'Test',
  description: '',
  icon: '🦁',
  type: 'addition',
  maxAnswer: 10,
  maxOperand: 9,
  showDots: false,
  problemsPerSession: 5,  // small for test speed
  masteryThreshold: 0.9,
  color: '#fff',
  unlockMessage: '',
}

const levelWithDotsAdd: Level = {
  ...levelNoDotsAdd,
  id: 4,
  showDots: true,
  maxAnswer: 10,
  maxOperand: 9,
}

const levelSubtract: Level = {
  id: 7,
  name: 'Test Sub',
  description: '',
  icon: '🐸',
  type: 'subtraction',
  maxAnswer: 5,
  maxOperand: 5,
  showDots: true,
  problemsPerSession: 5,
  masteryThreshold: 0.9,
  color: '#fff',
  unlockMessage: '',
}

// ── narrate() ────────────────────────────────────────────────────────────────

describe('narrate()', () => {
  it('counting: generic question with theme plural', () => {
    const p = makeCountingProblem(3)
    expect(narrate(p, dino)).toBe('How many dinosaurs do you see?')
    expect(narrate(p, space)).toBe('How many stars do you see?')
  })

  it('addition: uses operand1 and operand2 verbatim', () => {
    const p = makeAdditionProblem(3, 4)
    const text = narrate(p, dino)
    expect(text).toContain('3')
    expect(text).toContain('4')
    expect(text).toContain('dinosaurs')
  })

  it('addition: correct template structure', () => {
    const p = makeAdditionProblem(3, 4)
    expect(narrate(p, dino)).toBe('3 dinosaurs found 4 more. How many dinosaurs now?')
  })

  it('addition: uses theme.plural in sentence', () => {
    const p = makeAdditionProblem(2, 5)
    expect(narrate(p, space)).toContain('stars')
    expect(narrate(p, dino)).toContain('dinosaurs')
  })

  it('subtraction: correct template structure', () => {
    const p = makeSubtractionProblem(7, 3)
    expect(narrate(p, dino)).toBe(
      '7 dinosaurs were playing. 3 went home. How many dinosaurs are left?'
    )
  })

  it('subtraction: numbers come only from problem fields', () => {
    const p = makeSubtractionProblem(5, 2)
    const text = narrate(p, space)
    expect(text).toContain('5')
    expect(text).toContain('2')
    // The answer (3) should NOT appear in the narration
    expect(text).not.toContain('3')
  })

  it('answer is never embedded in narration (critical invariant)', () => {
    const p = makeAdditionProblem(4, 6)  // answer = 10
    const text = narrate(p, dino)
    // "10" should not appear — the sentence uses operand1 + operand2 only
    expect(text).not.toContain('10')
  })

  it('narration changes per theme.plural', () => {
    const p = makeAdditionProblem(2, 3)
    const texts = PRESET_THEMES.map(t => narrate(p, t))
    // each theme produces distinct text (different plural words)
    const unique = new Set(texts)
    expect(unique.size).toBe(PRESET_THEMES.length)
  })
})

// ── generateSession() ────────────────────────────────────────────────────────

describe('generateSession()', () => {
  it('returns { problems, showDots }', () => {
    const result = generateSession(levelNoDotsAdd)
    expect(result).toHaveProperty('problems')
    expect(result).toHaveProperty('showDots')
  })

  it('generates correct number of problems', () => {
    const result = generateSession(levelNoDotsAdd)
    expect(result.problems).toHaveLength(levelNoDotsAdd.problemsPerSession)
  })

  it('all problems have valid answers', () => {
    const result = generateSession(levelWithDotsAdd)
    for (const p of result.problems) {
      if (p.type === 'addition') {
        expect(p.answer).toBe((p.operand1) + (p.operand2 ?? 0))
      } else if (p.type === 'subtraction') {
        expect(p.answer).toBe((p.operand1) - (p.operand2 ?? 0))
      } else if (p.type === 'counting') {
        expect(p.answer).toBe(p.operand1)
      }
    }
  })

  it('showDots follows level.showDots when no adaptive offset', () => {
    const withDots = generateSession(levelWithDotsAdd)
    expect(withDots.showDots).toBe(true)

    const noDots = generateSession(levelNoDotsAdd)
    expect(noDots.showDots).toBe(false)
  })

  it('negative offset re-enables dots even on no-dots level', () => {
    const adaptive: AdaptiveState = { maxOperandOffset: -1, lastUpdated: '2024-01-01' }
    const result = generateSession(levelNoDotsAdd, adaptive)
    expect(result.showDots).toBe(true)
  })

  it('positive offset does not change showDots on no-dots level', () => {
    const adaptive: AdaptiveState = { maxOperandOffset: 1, lastUpdated: '2024-01-01' }
    const result = generateSession(levelNoDotsAdd, adaptive)
    expect(result.showDots).toBe(false)
  })

  it('positive offset does not change showDots on dots level', () => {
    const adaptive: AdaptiveState = { maxOperandOffset: 2, lastUpdated: '2024-01-01' }
    const result = generateSession(levelWithDotsAdd, adaptive)
    expect(result.showDots).toBe(true)
  })

  it('effectiveMaxOperand capped at maxAnswer - 1', () => {
    // Level with maxAnswer=10, maxOperand=9, offset=+3 → effective=min(12,9)=9
    const level: Level = { ...levelNoDotsAdd, maxOperand: 9, maxAnswer: 10 }
    const adaptive: AdaptiveState = { maxOperandOffset: 3, lastUpdated: '2024-01-01' }
    const result = generateSession(level, adaptive)
    for (const p of result.problems) {
      // operands should never exceed maxAnswer - 1 = 9
      expect(p.operand1).toBeLessThanOrEqual(9)
      if (p.operand2 !== null) expect(p.operand2).toBeLessThanOrEqual(9)
    }
  })

  it('effectiveMaxOperand minimum is 2 (subtraction needs a>=2)', () => {
    const level: Level = { ...levelSubtract, maxOperand: 5 }
    const adaptive: AdaptiveState = { maxOperandOffset: -10, lastUpdated: '2024-01-01' }
    const result = generateSession(level, adaptive)
    // Should still generate valid problems (not crash)
    expect(result.problems).toHaveLength(level.problemsPerSession)
    for (const p of result.problems) {
      expect(p.answer).toBeGreaterThan(0) // subtraction answer always positive
    }
  })

  it('no adaptive arg → same as offset 0', () => {
    // Run many times to check statistical equivalence (not exact — random)
    const r1 = generateSession(levelNoDotsAdd)
    const r2 = generateSession(levelNoDotsAdd, { maxOperandOffset: 0, lastUpdated: '' })
    // Both produce valid problems — same count and type
    expect(r1.problems).toHaveLength(r2.problems.length)
    expect(r1.showDots).toBe(r2.showDots)
  })

  it('subtraction problems have answer > 0', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateSession(levelSubtract)
      for (const p of result.problems) {
        expect(p.answer).toBeGreaterThan(0)
      }
    }
  })

  it('problem IDs are truthy', () => {
    const result = generateSession(levelNoDotsAdd)
    for (const p of result.problems) {
      expect(p.id).toBeTruthy()
    }
  })
})

// ── generateProblem() ────────────────────────────────────────────────────────

describe('generateProblem()', () => {
  it('counting: answer === operand1', () => {
    const level = CURRICULUM.find(l => l.type === 'counting')!
    for (let i = 0; i < 20; i++) {
      const p = generateProblem(level)
      expect(p.answer).toBe(p.operand1)
    }
  })

  it('addition: answer === operand1 + operand2', () => {
    const level = CURRICULUM.find(l => l.type === 'addition')!
    for (let i = 0; i < 20; i++) {
      const p = generateProblem(level)
      expect(p.answer).toBe((p.operand1) + (p.operand2 ?? 0))
    }
  })

  it('subtraction: answer === operand1 - operand2 > 0', () => {
    const level = CURRICULUM.find(l => l.type === 'subtraction')!
    for (let i = 0; i < 20; i++) {
      const p = generateProblem(level)
      expect(p.answer).toBe((p.operand1) - (p.operand2 ?? 0))
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('subtraction: operand1 >= 2', () => {
    const level = CURRICULUM.find(l => l.type === 'subtraction')!
    for (let i = 0; i < 20; i++) {
      const p = generateProblem(level)
      expect(p.operand1).toBeGreaterThanOrEqual(2)
    }
  })

  it('addition: answer does not exceed maxAnswer', () => {
    const level = CURRICULUM.find(l => l.type === 'addition')!
    for (let i = 0; i < 50; i++) {
      const p = generateProblem(level)
      expect(p.answer).toBeLessThanOrEqual(level.maxAnswer)
    }
  })
})
