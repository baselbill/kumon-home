// Concept-intro ("lesson") content — Kumon-style "concept launch".
//
// When a child reaches a level that introduces a NEW operation, the app should
// teach the idea before drilling it: bridge from a concept they already know →
// show a worked example → invite them to try. This module defines that content,
// keyed by the level that first introduces each operation.
//
// Design invariant (mirrors narrate() in problems.ts): numbers in lesson copy
// are small fixed constants chosen for clarity; the WORDS come from the active
// Theme (plural / noun / dotEmoji) so a child sees lessons in their chosen world.

import type { Theme } from './themes'
import type { Problem } from './problems'
import type { LevelType } from './curriculum'

/** A structured visual rendered inside a lesson step. */
export type LessonVisual =
  // N equal groups of M themed emoji — the bridge picture for multiplication.
  | { kind: 'groups'; groups: number; per: number }
  // Delegate to DotsDisplay using a synthetic problem (counting/addition/subtraction).
  | { kind: 'syntheticProblem'; problem: Problem }
  // A large formatted equation string, e.g. "4 + 4 + 4 = 12".
  | { kind: 'expression'; text: string }

export interface LessonStep {
  title: string
  body: string
  visual?: LessonVisual
}

export interface Lesson {
  levelId: number
  concept: string
  steps: LessonStep[]
}

// Helper: build a minimal synthetic Problem for DotsDisplay-backed visuals.
// id/answer are irrelevant for rendering but kept valid for type-safety.
function synthetic(
  type: LevelType,
  operand1: number,
  operand2: number | null,
  operator: Problem['operator'],
): Problem {
  return {
    id: 'lesson',
    type,
    operand1,
    operand2,
    operator,
    answer: 0,
    showDots: true,
  }
}

/**
 * Build the lesson for a level, or undefined if the level does not introduce a
 * new operation. Lessons exist only at the FIRST level of each operation:
 *   4 addition · 8 subtraction · 12 multiplication · 15 division ·
 *   18 powers · 19 square roots · 20 percentages · 21 algebra
 */
export function getLessonForLevel(levelId: number, theme: Theme): Lesson | undefined {
  const builder = LESSON_BUILDERS[levelId]
  return builder ? builder(theme) : undefined
}

/** Level IDs that have a concept-intro lesson (exported for tests / routing). */
export const LESSON_LEVEL_IDS = [4, 8, 12, 15, 18, 19, 20, 21] as const

type LessonBuilder = (theme: Theme) => Lesson

const LESSON_BUILDERS: Record<number, LessonBuilder> = {
  // ── Level 4: Addition ──────────────────────────────────────────────────────
  4: (t): Lesson => ({
    levelId: 4,
    concept: 'addition',
    steps: [
      {
        title: 'Putting together',
        body: `Adding means putting groups together. Here are 2 ${t.plural} and 3 more ${t.plural}.`,
        visual: { kind: 'syntheticProblem', problem: synthetic('addition', 2, 3, '+') },
      },
      {
        title: 'Count them all',
        body: `Count every one to find how many altogether: 2 and 3 makes 5.`,
        visual: { kind: 'expression', text: '2 + 3 = 5' },
      },
      {
        title: 'Your turn',
        body: `The + sign means "and". Count both groups to find the total. Let's try!`,
      },
    ],
  }),

  // ── Level 8: Subtraction ───────────────────────────────────────────────────
  8: (t): Lesson => ({
    levelId: 8,
    concept: 'subtraction',
    steps: [
      {
        title: 'Taking away',
        body: `Subtracting means taking some away. Start with 5 ${t.plural}, then 2 leave.`,
        visual: { kind: 'syntheticProblem', problem: synthetic('subtraction', 5, 2, '-') },
      },
      {
        title: 'How many are left?',
        body: `The ones with ❌ have gone. Count what stays: 5 take away 2 leaves 3.`,
        visual: { kind: 'expression', text: '5 − 2 = 3' },
      },
      {
        title: 'Your turn',
        body: `The − sign means "take away". Count what is left. Let's try!`,
      },
    ],
  }),

  // ── Level 12: Multiplication (flagship — full Kumon bridge) ─────────────────
  12: (t): Lesson => ({
    levelId: 12,
    concept: 'multiplication',
    steps: [
      {
        title: 'Equal groups',
        body: `Multiplying starts with equal groups. Here are 3 groups, with 4 ${t.plural} in each group.`,
        visual: { kind: 'groups', groups: 3, per: 4 },
      },
      {
        title: 'Add them up',
        body: `You could add the groups: 4 and 4 and 4. That makes 12 ${t.plural}.`,
        visual: { kind: 'expression', text: '4 + 4 + 4 = 12' },
      },
      {
        title: 'A faster way',
        body: `× means "groups of". So 3 × 4 means 3 groups of 4 — the same 12, but quicker!`,
        visual: { kind: 'expression', text: '3 × 4 = 12' },
      },
      {
        title: 'Your turn',
        body: `When you see 3 × 4, think "3 groups of 4". Look for the groups. Let's try!`,
      },
    ],
  }),

  // ── Level 15: Division (bridge: inverse of multiplication) ──────────────────
  15: (t): Lesson => ({
    levelId: 15,
    concept: 'division',
    steps: [
      {
        title: 'Sharing equally',
        body: `Dividing means sharing into equal groups. Share 12 ${t.plural} into 3 equal groups.`,
        visual: { kind: 'groups', groups: 3, per: 4 },
      },
      {
        title: 'How many in each?',
        body: `Each group gets 4. So 12 shared into 3 groups is 4 each.`,
        visual: { kind: 'expression', text: '12 ÷ 3 = 4' },
      },
      {
        title: 'Division undoes multiplying',
        body: `Remember 3 × 4 = 12? Division goes backwards: 12 ÷ 3 = 4. Let's try!`,
      },
    ],
  }),

  // ── Level 18: Powers ───────────────────────────────────────────────────────
  18: (): Lesson => ({
    levelId: 18,
    concept: 'powers',
    steps: [
      {
        title: 'A power is repeated multiplying',
        body: `2 to the power of 3 means multiply 2 by itself 3 times.`,
        visual: { kind: 'expression', text: '2 × 2 × 2 = 8' },
      },
      {
        title: 'The small number counts the 2s',
        body: `The little raised number tells you how many to multiply together. So 2³ = 8.`,
        visual: { kind: 'expression', text: '2³ = 8' },
      },
      {
        title: 'Your turn',
        body: `Multiply the big number by itself, as many times as the small number says. Let's try!`,
      },
    ],
  }),

  // ── Level 19: Square roots (bridge: inverse of squaring) ───────────────────
  19: (): Lesson => ({
    levelId: 19,
    concept: 'square roots',
    steps: [
      {
        title: 'Squaring a number',
        body: `3 squared means 3 × 3, which is 9.`,
        visual: { kind: 'expression', text: '3 × 3 = 9' },
      },
      {
        title: 'A square root goes backwards',
        body: `The square root of 9 asks: what number times itself makes 9? The answer is 3.`,
        visual: { kind: 'expression', text: '√9 = 3' },
      },
      {
        title: 'Your turn',
        body: `For √, find the number that times itself gives the number inside. Let's try!`,
      },
    ],
  }),

  // ── Level 20: Percentages ──────────────────────────────────────────────────
  20: (): Lesson => ({
    levelId: 20,
    concept: 'percentages',
    steps: [
      {
        title: 'Percent means out of 100',
        body: `100% is all of something. 50% is half. 10% is one tenth.`,
        visual: { kind: 'expression', text: '50% = half' },
      },
      {
        title: 'Find a percent of a number',
        body: `10% of 20 means one tenth of 20. Split 20 into 10 parts — each part is 2.`,
        visual: { kind: 'expression', text: '10% of 20 = 2' },
      },
      {
        title: 'Your turn',
        body: `A percent is just a part of the whole number. Let's try!`,
      },
    ],
  }),

  // ── Level 21: Algebra ──────────────────────────────────────────────────────
  21: (): Lesson => ({
    levelId: 21,
    concept: 'algebra',
    steps: [
      {
        title: 'x is a mystery number',
        body: `In algebra, the letter x stands for a number we do not know yet.`,
        visual: { kind: 'expression', text: 'x + 3 = 5' },
      },
      {
        title: 'Find what x must be',
        body: `What plus 3 makes 5? It must be 2. So x = 2.`,
        visual: { kind: 'expression', text: 'x = 2' },
      },
      {
        title: 'Your turn',
        body: `Work out the number that makes the equation true. Let's try!`,
      },
    ],
  }),
}
