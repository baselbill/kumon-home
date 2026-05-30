import { describe, it, expect } from 'vitest'
import { getLessonForLevel, LESSON_LEVEL_IDS } from '../lessons'
import { CURRICULUM, TOTAL_LEVELS } from '../curriculum'
import { PRESET_THEMES } from '../themes'
import { migrateProfile, createProfile } from '../storage'

const theme = PRESET_THEMES[0]

describe('getLessonForLevel', () => {
  it('returns a lesson for every new-operation level', () => {
    for (const id of LESSON_LEVEL_IDS) {
      const lesson = getLessonForLevel(id, theme)
      expect(lesson, `level ${id} should have a lesson`).toBeDefined()
      expect(lesson!.levelId).toBe(id)
    }
  })

  it('returns undefined for levels that do not introduce a new operation', () => {
    const introLevels = new Set<number>(LESSON_LEVEL_IDS)
    for (let id = 1; id <= TOTAL_LEVELS; id++) {
      if (introLevels.has(id)) continue
      expect(getLessonForLevel(id, theme), `level ${id} should have no lesson`).toBeUndefined()
    }
  })

  it('matches a lesson to the first level of each operation type', () => {
    // Multiplication first appears at L12, division at L15 — assert the bridge
    // lessons sit exactly where the operation is introduced.
    expect(getLessonForLevel(12, theme)!.concept).toBe('multiplication')
    expect(getLessonForLevel(15, theme)!.concept).toBe('division')
  })

  it('every lesson has at least two non-empty steps ending in practice', () => {
    for (const id of LESSON_LEVEL_IDS) {
      const lesson = getLessonForLevel(id, theme)!
      expect(lesson.steps.length).toBeGreaterThanOrEqual(2)
      for (const step of lesson.steps) {
        expect(step.title.trim()).not.toBe('')
        expect(step.body.trim()).not.toBe('')
      }
      // Final step is the "your turn" call to action.
      expect(lesson.steps[lesson.steps.length - 1].body.toLowerCase()).toContain("let's try")
    }
  })

  it('uses theme words in copy so lessons match the chosen world', () => {
    const space = PRESET_THEMES.find(t => t.key === 'space')!
    const mult = getLessonForLevel(12, space)!
    // The equal-groups step references the themed plural ("stars"), not "dinosaurs".
    const joined = mult.steps.map(s => s.body).join(' ')
    expect(joined).toContain(space.plural)
    expect(joined).not.toContain('dinosaurs')
  })

  it('groups visual on the multiplication lesson shows 3 groups of 4', () => {
    const mult = getLessonForLevel(12, theme)!
    const groupsStep = mult.steps.find(s => s.visual?.kind === 'groups')
    expect(groupsStep).toBeDefined()
    const v = groupsStep!.visual!
    expect(v.kind).toBe('groups')
    if (v.kind === 'groups') {
      expect(v.groups).toBe(3)
      expect(v.per).toBe(4)
    }
  })

  it('lesson level IDs all exist in the curriculum', () => {
    const ids = new Set(CURRICULUM.map(l => l.id))
    for (const id of LESSON_LEVEL_IDS) expect(ids.has(id)).toBe(true)
  })
})

describe('seenIntros storage', () => {
  it('defaults to an empty array for new profiles', () => {
    const p = createProfile('Kid', 'dinosaurs', false, 1)
    expect(p.seenIntros).toEqual([])
  })

  it('migrates an old save without seenIntros to an empty array', () => {
    const legacy = { profileId: 'p1', profileName: 'Old', themeKey: 'ocean', version: 5 }
    const migrated = migrateProfile(legacy as unknown as Record<string, unknown>)
    expect(migrated.seenIntros).toEqual([])
  })

  it('preserves an existing seenIntros list through migration', () => {
    const saved = { profileId: 'p2', profileName: 'Has', themeKey: 'ocean', version: 5, seenIntros: [12] }
    const migrated = migrateProfile(saved as unknown as Record<string, unknown>)
    expect(migrated.seenIntros).toEqual([12])
  })
})
