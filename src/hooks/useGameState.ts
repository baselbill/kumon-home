'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getLevelById, Level } from '@/lib/curriculum'
import { Problem, generateSession } from '@/lib/problems'
import {
  LevelProgress,
  ProfileSave,
  WeakPair,
  loadProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId as persistActiveProfileId,
  updateStreak,
  checkNewAchievements,
  ALL_ACHIEVEMENTS,
  Achievement,
} from '@/lib/storage'
import { Theme, PRESET_THEMES } from '@/lib/themes'
import { playCorrectSound, playWrongSound, playLevelCompleteSound } from '@/lib/sounds'
import { FeedbackState, FloatingStar, ProblemAttempt, SessionResult } from '@/types/game'

function mergeWeakPairs(existing: WeakPair[], incoming: WeakPair[]): WeakPair[] {
  const map = new Map<string, WeakPair>()
  for (const p of existing) map.set(`${p.a}${p.op}${p.b}`, p)
  for (const p of incoming) {
    const key = `${p.a}${p.op}${p.b}`
    const prev = map.get(key)
    map.set(key, { ...p, misses: (prev?.misses ?? 0) + p.misses })
  }
  return Array.from(map.values()).sort((a, b) => b.misses - a.misses).slice(0, 5)
}

export function useGameState() {
  // ── Multi-profile state ───────────────────────────────────
  const [profiles, setProfiles] = useState<ProfileSave[]>(() => loadProfiles())
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => {
    const savedId = getActiveProfileId()
    const profs = loadProfiles()
    if (savedId && profs.some(p => p.profileId === savedId)) return savedId
    return profs[0]?.profileId ?? ''
  })

  // Derived active profile and theme
  const activeProfile = profiles.find(p => p.profileId === activeProfileId) ?? profiles[0]
  const theme: Theme = PRESET_THEMES.find(t => t.key === activeProfile?.themeKey) ?? PRESET_THEMES[0]

  // ── Session state ────────────────────────────────────────
  const [activeLevelId, setActiveLevelId] = useState<number>(1)
  const [problems, setProblems] = useState<Problem[]>([])
  const [sessionShowDots, setSessionShowDots] = useState<boolean>(true)
  const [problemIndex, setProblemIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>('none')
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null)
  const [floatingStars, setFloatingStars] = useState<FloatingStar[]>([])
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null)
  const [toastQueue, setToastQueue] = useState<Achievement[]>([])

  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const starIdRef = useRef(0)
  const problemStartTime = useRef<number>(Date.now())
  const sessionStartTimeRef = useRef<number>(Date.now())
  const sessionAttemptsRef = useRef<ProblemAttempt[]>([])
  const sessionCorrectRef = useRef(0)  // mirror of sessionCorrect for closure-safe endSession
  const requeuedSet = useRef<Set<string>>(new Set())  // problem IDs already re-queued this session

  // ── Live session timer ────────────────────────────────────
  const [sessionElapsedSec, setSessionElapsedSec] = useState(0)
  // isPlaying: true while a session is active (problems loaded, no result yet)
  const isPlaying = problems.length > 0 && sessionResult === null

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setSessionElapsedSec(Math.floor((Date.now() - sessionStartTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying])

  // ── Profile helpers ───────────────────────────────────────

  const switchProfile = useCallback((id: string) => {
    setActiveProfileIdState(id)
    persistActiveProfileId(id)
  }, [])

  const updateProfile = useCallback(
    (profileId: string, updater: (prev: ProfileSave) => ProfileSave) => {
      setProfiles(prev => {
        const idx = prev.findIndex(p => p.profileId === profileId)
        if (idx === -1) return prev
        const updated = updater(prev[idx])
        const next = [...prev]
        next[idx] = updated
        saveProfiles(next)
        return next
      })
    },
    []
  )

  // ── Update streak on mount (and when switching profiles) ─
  useEffect(() => {
    if (!activeProfileId) return
    updateProfile(activeProfileId, prev => updateStreak(prev))
  }, [activeProfileId, updateProfile])

  // ── Achievement toast queue ───────────────────────────────
  useEffect(() => {
    if (!toastAchievement && toastQueue.length > 0) {
      setToastAchievement(toastQueue[0])
      setToastQueue(q => q.slice(1))
    }
  }, [toastAchievement, toastQueue])

  // ── Start a session ───────────────────────────────────────
  const startSession = useCallback((levelId: number) => {
    const level = getLevelById(levelId)
    if (!level) return

    setActiveLevelId(levelId)

    // Get this profile's adaptive state for this level
    const prof = profiles.find(p => p.profileId === activeProfileId) ?? profiles[0]
    const adaptiveState = prof?.adaptiveState?.[levelId]

    const { problems: generatedProblems, showDots: effectiveShowDots } =
      generateSession(level, adaptiveState)

    setProblems(generatedProblems)
    setSessionShowDots(effectiveShowDots)
    setProblemIndex(0)
    setUserAnswer('')
    setFeedback('none')
    setSessionCorrect(0)
    sessionCorrectRef.current = 0
    setSessionResult(null)
    setFloatingStars([])
    sessionAttemptsRef.current = []
    requeuedSet.current = new Set()
    problemStartTime.current = Date.now()
    sessionStartTimeRef.current = Date.now()
    setSessionElapsedSec(0)
  }, [profiles, activeProfileId])

  // ── Digit input ───────────────────────────────────────────
  const handleDigit = useCallback((d: number) => {
    setUserAnswer(prev => {
      if (prev.length >= 3) return prev  // max 3 digits (answers ≤ 999)
      return prev + String(d)
    })
  }, [])

  const handleBackspace = useCallback(() => {
    setUserAnswer(prev => prev.slice(0, -1))
  }, [])

  // ── Submit answer ─────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (feedback !== 'none') return
    if (userAnswer === '') return

    const level = getLevelById(activeLevelId)
    if (!level) return
    const problem = problems[problemIndex]
    if (!problem) return

    const parsed = parseInt(userAnswer, 10)
    const isRight = parsed === problem.answer
    const responseMs = Date.now() - problemStartTime.current

    // Record attempt for adaptive analysis
    sessionAttemptsRef.current.push({
      problemIndex,
      correct: isRight,
      responseTimeMs: responseMs,
      operand1: problem.operand1,
      operand2: problem.operand2,
      operator: problem.operator,
    })

    if (isRight) {
      playCorrectSound(theme.soundStyle)
      setFeedback('correct')
      setSessionCorrect(c => {
        sessionCorrectRef.current = c + 1
        return c + 1
      })
      // Spawn floating star
      const id = ++starIdRef.current
      setFloatingStars(s => [...s, { id, x: 30 + Math.random() * 40, y: 0 }])
      setTimeout(() => setFloatingStars(s => s.filter(x => x.id !== id)), 1400)
    } else {
      playWrongSound()
      setFeedback('wrong')
    }

    // Auto-advance after delay
    const delay = isRight ? 1400 : 2400
    feedbackTimer.current = setTimeout(() => {
      advanceProblem(isRight, level, problem, problems.length)
    }, delay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, userAnswer, activeLevelId, problems, problemIndex, theme.soundStyle])

  // ── Advance to next problem or end session ────────────────
  const advanceProblem = useCallback(
    (wasCorrect: boolean, level: Level, currentProblem: Problem, currentLength: number) => {
      const nextIndex = problemIndex + 1
      let sessionEnds = nextIndex >= currentLength

      // Layer 1: re-queue wrong answers once per problem
      if (!wasCorrect && !requeuedSet.current.has(currentProblem.id)) {
        requeuedSet.current.add(currentProblem.id)
        setProblems(prev => [...prev, { ...currentProblem }])
        sessionEnds = false
      }

      if (sessionEnds) {
        endSession(wasCorrect, level)
      } else {
        setProblemIndex(nextIndex)
        setUserAnswer('')
        setFeedback('none')
        problemStartTime.current = Date.now()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problemIndex]
  )

  // ── End session: compute results + adaptive analysis ──────
  const endSession = useCallback(
    (lastWasCorrect: boolean, level: Level) => {
      const finalCorrect = sessionCorrectRef.current + (lastWasCorrect ? 1 : 0)
      const total = level.problemsPerSession
      const mastered = finalCorrect / total >= level.masteryThreshold
      const isPerfect = finalCorrect === total
      const starsEarned = finalCorrect + (isPerfect ? 5 : 0)

      // ── Adaptive analysis on final 10 of session ──────────
      const attempts = sessionAttemptsRef.current
      const final10 = attempts.slice(-10)
      // D3: typed sentinel instead of `as any`
      type OffsetDirection = 'up' | 'down' | null
      let offsetDirection: OffsetDirection = null
      let adaptiveBanner = false

      if (final10.length >= 10) {
        const accuracy = final10.filter(a => a.correct).length / 10
        const avgTime = final10.reduce((s, a) => s + a.responseTimeMs, 0) / 10
        const hitHighBar = accuracy > 0.95 && avgTime < 3000
        const hitLowBar  = accuracy < 0.70

        if (hitHighBar) {
          offsetDirection = 'up'
          if (!mastered) adaptiveBanner = true
        } else if (hitLowBar) {
          offsetDirection = 'down'
        }
      }

      // ── Layer 2: compute weak pairs from wrong answers ─────
      const wrongAttempts = attempts.filter(a => !a.correct && a.operand2 !== null && a.operator)
      const pairMap = new Map<string, WeakPair>()
      for (const a of wrongAttempts) {
        const key = `${a.operand1}${a.operator}${a.operand2}`
        const prev = pairMap.get(key)
        pairMap.set(key, {
          a: a.operand1,
          b: a.operand2 as number,
          op: a.operator as string,
          misses: (prev?.misses ?? 0) + 1,
        })
      }
      const sessionWeakPairs = Array.from(pairMap.values())

      // D2: All profile reads + writes happen inside the functional updater
      // so they always operate on the latest state, never a stale snapshot.
      // collectedNewAchIds is written synchronously by the updater before
      // React schedules a re-render, making it safe to read immediately after.
      let collectedNewAchIds: string[] = []

      setProfiles(prev => {
        const idx = prev.findIndex(p => p.profileId === activeProfileId)
        if (idx === -1) return prev
        const prof = prev[idx]  // always the current, unambiguous profile

        const currentAdaptiveOffset = prof.adaptiveState?.[level.id]?.maxOperandOffset ?? 0
        const resolvedOffset =
          offsetDirection === 'up'
            ? Math.min(currentAdaptiveOffset + 1, 3)
            : offsetDirection === 'down'
              ? Math.max(currentAdaptiveOffset - 1, -2)
              : currentAdaptiveOffset

        // ── Build updated profile ──────────────────────────────
        const existing: LevelProgress = prof.levelProgress[level.id] ?? {
          bestScore: 0,
          totalAttempts: 0,
          totalCorrect: 0,
          completed: false,
        }
        const newProg: LevelProgress = {
          bestScore: Math.max(existing.bestScore, finalCorrect),
          totalAttempts: existing.totalAttempts + total,
          totalCorrect: existing.totalCorrect + finalCorrect,
          completed: existing.completed || mastered,
          completedAt: existing.completed
            ? existing.completedAt
            : mastered ? new Date().toISOString() : undefined,
        }

        const newHighest = mastered
          ? Math.max(prof.highestUnlockedLevel, level.id + 1)
          : prof.highestUnlockedLevel

        let updated: ProfileSave = {
          ...prof,
          totalStars: prof.totalStars + starsEarned,
          totalSessionsPlayed: prof.totalSessionsPlayed + 1,
          totalProblemsAnswered: prof.totalProblemsAnswered + total,
          totalCorrectAnswers: prof.totalCorrectAnswers + finalCorrect,
          highestUnlockedLevel: newHighest,
          levelProgress: { ...prof.levelProgress, [level.id]: newProg },
          adaptiveState: {
            ...prof.adaptiveState,
            [level.id]: {
              maxOperandOffset: resolvedOffset,
              lastUpdated: new Date().toISOString(),
              weakPairs: mergeWeakPairs(
                prof.adaptiveState?.[level.id]?.weakPairs ?? [],
                sessionWeakPairs
              ),
            },
          },
        }

        // ── Achievements ───────────────────────────────────────
        const prevHadPerfect = prof.achievements.includes('perfect_session')
        const newAchIds: string[] = []

        if (isPerfect && !prevHadPerfect) {
          updated = { ...updated, achievements: [...updated.achievements, 'perfect_session'] }
          newAchIds.push('perfect_session')
        }

        const autoAchIds = checkNewAchievements(updated)
        if (autoAchIds.length > 0) {
          updated = { ...updated, achievements: [...updated.achievements, ...autoAchIds] }
          newAchIds.push(...autoAchIds)
        }

        collectedNewAchIds = newAchIds  // capture for post-updater side effects

        const next = [...prev]
        next[idx] = updated
        saveProfiles(next)
        return next
      })

      // ── Queue achievement toasts ───────────────────────────
      if (collectedNewAchIds.length > 0) {
        const toasts = collectedNewAchIds
          .map(id => ALL_ACHIEVEMENTS.find(a => a.id === id))
          .filter((a): a is Achievement => !!a)
        setToastQueue(q => [...q, ...toasts])
      }

      // ── Timing ────────────────────────────────────────────
      const durationMs = Date.now() - sessionStartTimeRef.current
      const avgResponseMs = attempts.length > 0
        ? Math.round(attempts.reduce((s, a) => s + a.responseTimeMs, 0) / attempts.length)
        : 0

      // ── Set result and advance screen ──────────────────────
      const result: SessionResult = {
        levelId: level.id,
        correct: finalCorrect,
        total,
        mastered,
        isPerfect,
        starsEarned,
        newAchievements: collectedNewAchIds,
        adaptiveBanner,
        durationMs,
        avgResponseMs,
      }
      setSessionResult(result)
      if (mastered) playLevelCompleteSound()
    },
    [activeProfileId]  // D2: `profiles` removed — updater reads fresh prev instead
  )

  // ── Cleanup timers ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    }
  }, [])

  // ── Derived values ────────────────────────────────────────
  const activeLevel = getLevelById(activeLevelId)

  return {
    // profile
    profiles,
    setProfiles,
    activeProfile,
    activeProfileId,
    theme,
    switchProfile,
    updateProfile,
    // session
    activeLevelId,
    activeLevel,
    problems,
    problemIndex,
    userAnswer,
    feedback,
    sessionCorrect,
    sessionResult,
    floatingStars,
    sessionShowDots,
    sessionElapsedSec,
    // actions
    startSession,
    handleDigit,
    handleBackspace,
    handleSubmit,
    // toasts
    toastAchievement,
    setToastAchievement,
    toastQueue,
  }
}
