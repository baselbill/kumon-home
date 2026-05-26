import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadProfiles,
  saveProfiles,
  createProfile,
  updateStreak,
  checkNewAchievements,
  getActiveProfileId,
  setActiveProfileId,
  ALL_ACHIEVEMENTS,
} from '../storage'
import type { ProfileSave, GameSave } from '../storage'

// ── localStorage mock helpers ────────────────────────────────────────────────

function clearStorage() {
  localStorage.clear()
}

function seedStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

const PROFILES_KEY = 'kumon_profiles_v1'
const SAVE_KEY = 'kumon_home_v1'
const ACTIVE_KEY = 'kumon_active_profile'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSave(overrides: Partial<GameSave> = {}): GameSave {
  return {
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
    ...overrides,
  }
}

function makeProfile(overrides: Partial<ProfileSave> = {}): ProfileSave {
  return {
    ...makeSave(),
    profileId: 'profile-test-1',
    profileName: 'Test Kid',
    themeKey: 'dinosaurs',
    readerMode: false,
    adaptiveState: {},
    ...overrides,
  }
}

// ── loadProfiles() ──────────────────────────────────────────────────────────

describe('loadProfiles()', () => {
  beforeEach(() => clearStorage())

  it('returns [] when localStorage is completely empty', () => {
    expect(loadProfiles()).toEqual([])
  })

  it('returns profiles when kumon_profiles_v1 exists', () => {
    const profiles = [makeProfile()]
    seedStorage(PROFILES_KEY, profiles)
    const loaded = loadProfiles()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].profileId).toBe('profile-test-1')
  })

  it('returns [] when kumon_profiles_v1 is an empty array', () => {
    seedStorage(PROFILES_KEY, [])
    expect(loadProfiles()).toEqual([])
  })

  it('migration: legacy kumon_home_v1 → profiles[0]', () => {
    const legacySave = makeSave({ highestUnlockedLevel: 5 })
    seedStorage(SAVE_KEY, legacySave)

    const profiles = loadProfiles()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].profileId).toBe('profile-legacy')
    expect(profiles[0].profileName).toBe('Player')
    expect(profiles[0].themeKey).toBe('dinosaurs')
  })

  it('migration CRITICAL: highestUnlockedLevel=11 sentinel preserved verbatim', () => {
    // 11 = all-levels-done sentinel — must NOT be clamped to TOTAL_LEVELS (10)
    const legacySave = makeSave({ highestUnlockedLevel: 11 })
    seedStorage(SAVE_KEY, legacySave)

    const profiles = loadProfiles()
    expect(profiles[0].highestUnlockedLevel).toBe(11)
  })

  it('migration: copies all GameSave fields to migrated profile', () => {
    const legacySave = makeSave({
      totalStars: 99,
      streak: 7,
      totalSessionsPlayed: 42,
    })
    seedStorage(SAVE_KEY, legacySave)

    const profiles = loadProfiles()
    expect(profiles[0].totalStars).toBe(99)
    expect(profiles[0].streak).toBe(7)
    expect(profiles[0].totalSessionsPlayed).toBe(42)
  })

  it('migration: saves migrated profiles to kumon_profiles_v1', () => {
    seedStorage(SAVE_KEY, makeSave())
    loadProfiles()
    // After migration, profiles key should be set
    const raw = localStorage.getItem(PROFILES_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(1)
  })

  it('kumon_profiles_v1 takes priority over legacy save', () => {
    const profiles = [makeProfile({ profileName: 'From Profiles' })]
    seedStorage(PROFILES_KEY, profiles)
    seedStorage(SAVE_KEY, makeSave({ totalStars: 999 }))

    const loaded = loadProfiles()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].profileName).toBe('From Profiles')
  })

  it('handles malformed JSON gracefully', () => {
    localStorage.setItem(PROFILES_KEY, 'not-json')
    expect(() => loadProfiles()).not.toThrow()
  })
})

// ── saveProfiles() ───────────────────────────────────────────────────────────

describe('saveProfiles()', () => {
  beforeEach(() => clearStorage())

  it('writes profiles to kumon_profiles_v1', () => {
    const profiles = [makeProfile()]
    saveProfiles(profiles)
    const raw = localStorage.getItem(PROFILES_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed[0].profileId).toBe('profile-test-1')
  })

  it('overwrites existing profiles', () => {
    saveProfiles([makeProfile({ profileName: 'First' })])
    saveProfiles([makeProfile({ profileName: 'Second' })])
    const loaded = loadProfiles()
    expect(loaded[0].profileName).toBe('Second')
  })
})

// ── createProfile() ──────────────────────────────────────────────────────────

describe('createProfile()', () => {
  it('creates profile with correct name, themeKey, readerMode', () => {
    const p = createProfile('Luna', 'cats', true)
    expect(p.profileName).toBe('Luna')
    expect(p.themeKey).toBe('cats')
    expect(p.readerMode).toBe(true)
  })

  it('starts with zero progress', () => {
    const p = createProfile('Kid', 'space', false)
    expect(p.totalStars).toBe(0)
    expect(p.streak).toBe(0)
    expect(p.totalSessionsPlayed).toBe(0)
    expect(p.achievements).toEqual([])
    expect(p.highestUnlockedLevel).toBe(1)
  })

  it('assigns a unique profileId each call', () => {
    const p1 = createProfile('A', 'space', false)
    const p2 = createProfile('B', 'ocean', false)
    expect(p1.profileId).not.toBe(p2.profileId)
  })

  it('initializes adaptiveState as empty object', () => {
    const p = createProfile('Kid', 'robots', false)
    expect(p.adaptiveState).toEqual({})
  })
})

// ── getActiveProfileId / setActiveProfileId ───────────────────────────────

describe('active profile ID', () => {
  beforeEach(() => clearStorage())

  it('getActiveProfileId returns null when not set', () => {
    expect(getActiveProfileId()).toBeNull()
  })

  it('setActiveProfileId then getActiveProfileId round-trips', () => {
    setActiveProfileId('profile-abc-123')
    expect(getActiveProfileId()).toBe('profile-abc-123')
  })
})

// ── updateStreak() ───────────────────────────────────────────────────────────

describe('updateStreak()', () => {
  function makeDate(daysAgo: number): string {
    return new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10)
  }

  it('streak = 1 on first ever play (lastPlayDate = null)', () => {
    const save = makeSave({ lastPlayDate: null, streak: 0 })
    const updated = updateStreak(save)
    expect(updated.streak).toBe(1)
    expect(updated.lastPlayDate).toBe(new Date().toISOString().slice(0, 10))
  })

  it('streak increments when played yesterday', () => {
    const save = makeSave({ lastPlayDate: makeDate(1), streak: 3 })
    const updated = updateStreak(save)
    expect(updated.streak).toBe(4)
  })

  it('streak resets to 1 when last played 2+ days ago', () => {
    const save = makeSave({ lastPlayDate: makeDate(2), streak: 5 })
    const updated = updateStreak(save)
    expect(updated.streak).toBe(1)
  })

  it('streak unchanged when already played today', () => {
    const today = new Date().toISOString().slice(0, 10)
    const save = makeSave({ lastPlayDate: today, streak: 7 })
    const updated = updateStreak(save)
    expect(updated.streak).toBe(7)
  })

  it('preserves all other fields (generic test)', () => {
    const save = makeSave({ totalStars: 42, lastPlayDate: makeDate(1), streak: 2 })
    const updated = updateStreak(save)
    expect(updated.totalStars).toBe(42)
  })

  it('works with ProfileSave (generic type param)', () => {
    const profile: ProfileSave = {
      ...makeSave({ lastPlayDate: makeDate(1), streak: 1 }),
      profileId: 'test',
      profileName: 'Test',
      themeKey: 'space',
      readerMode: false,
      adaptiveState: {},
    }
    const updated = updateStreak(profile)
    // ProfileSave fields preserved
    expect(updated.profileId).toBe('test')
    expect(updated.themeKey).toBe('space')
    expect(updated.readerMode).toBe(false)
    expect(updated.streak).toBe(2)
  })
})

// ── checkNewAchievements() ───────────────────────────────────────────────────

describe('checkNewAchievements()', () => {
  it('returns [] for baseline save (no achievements earned)', () => {
    const save = makeSave()
    expect(checkNewAchievements(save)).toEqual([])
  })

  it('first_correct at totalCorrectAnswers = 1', () => {
    const save = makeSave({ totalCorrectAnswers: 1 })
    expect(checkNewAchievements(save)).toContain('first_correct')
  })

  it('first_correct NOT re-earned if already in achievements', () => {
    const save = makeSave({ totalCorrectAnswers: 5, achievements: ['first_correct'] })
    expect(checkNewAchievements(save)).not.toContain('first_correct')
  })

  it('first_session at totalSessionsPlayed = 1', () => {
    const save = makeSave({ totalSessionsPlayed: 1 })
    expect(checkNewAchievements(save)).toContain('first_session')
  })

  it('first_level at highestUnlockedLevel = 2', () => {
    const save = makeSave({ highestUnlockedLevel: 2 })
    expect(checkNewAchievements(save)).toContain('first_level')
  })

  it('streak_3 at streak = 3', () => {
    const save = makeSave({ streak: 3 })
    expect(checkNewAchievements(save)).toContain('streak_3')
  })

  it('streak_7 at streak = 7', () => {
    const save = makeSave({ streak: 7 })
    expect(checkNewAchievements(save)).toContain('streak_7')
  })

  it('stars_50 at totalStars = 50', () => {
    const save = makeSave({ totalStars: 50 })
    expect(checkNewAchievements(save)).toContain('stars_50')
  })

  it('stars_200 at totalStars = 200', () => {
    const save = makeSave({ totalStars: 200 })
    expect(checkNewAchievements(save)).toContain('stars_200')
  })

  it('level_5 at highestUnlockedLevel = 5', () => {
    const save = makeSave({ highestUnlockedLevel: 5 })
    expect(checkNewAchievements(save)).toContain('level_5')
  })

  it('level_10 at highestUnlockedLevel = 11 (all-done sentinel)', () => {
    // After completing level 10, highestUnlockedLevel becomes 11
    const save = makeSave({ highestUnlockedLevel: 11 })
    expect(checkNewAchievements(save)).toContain('level_10')
  })

  it('level_10 NOT earned at highestUnlockedLevel = 10', () => {
    // Check requires > 10, not >= 10
    const save = makeSave({ highestUnlockedLevel: 10 })
    expect(checkNewAchievements(save)).not.toContain('level_10')
  })

  it('sessions_10 at totalSessionsPlayed = 10', () => {
    const save = makeSave({ totalSessionsPlayed: 10 })
    expect(checkNewAchievements(save)).toContain('sessions_10')
  })

  it('perfect_session: NOT in checkNewAchievements (checked manually in endSession)', () => {
    // perfect_session is special-cased in MathGame.tsx, not in checkNewAchievements
    const save = makeSave()
    expect(checkNewAchievements(save)).not.toContain('perfect_session')
  })

  it('multiple achievements can be earned in one call', () => {
    const save = makeSave({
      totalCorrectAnswers: 1,
      totalSessionsPlayed: 1,
      highestUnlockedLevel: 2,
    })
    const earned = checkNewAchievements(save)
    expect(earned).toContain('first_correct')
    expect(earned).toContain('first_session')
    expect(earned).toContain('first_level')
  })

  it('does not re-earn achievements already in the list', () => {
    const save = makeSave({
      totalStars: 200,
      streak: 7,
      achievements: ['stars_50', 'stars_200', 'streak_3', 'streak_7'],
    })
    const earned = checkNewAchievements(save)
    expect(earned).not.toContain('stars_50')
    expect(earned).not.toContain('stars_200')
    expect(earned).not.toContain('streak_3')
    expect(earned).not.toContain('streak_7')
  })

  it('ALL_ACHIEVEMENTS covers every ID that checkNewAchievements can emit', () => {
    // Seed a save that should trigger every achievement
    const save = makeSave({
      totalCorrectAnswers: 1,
      totalSessionsPlayed: 10,
      highestUnlockedLevel: 11,
      streak: 7,
      totalStars: 200,
    })
    const earned = checkNewAchievements(save)
    const allIds = new Set(ALL_ACHIEVEMENTS.map(a => a.id))
    for (const id of earned) {
      expect(allIds.has(id), `earned achievement '${id}' not in ALL_ACHIEVEMENTS`).toBe(true)
    }
  })
})
