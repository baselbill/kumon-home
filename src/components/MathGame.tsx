'use client'

import React, {
  useState,
  useEffect,
  useCallback,
} from 'react'
import { getLevelById, getStartingLevel, TOTAL_LEVELS } from '@/lib/curriculum'
import {
  ProfileSave,
  saveProfiles,
  createProfile,
} from '@/lib/storage'
import { PRESET_THEMES } from '@/lib/themes'
import { Achievement } from '@/lib/storage'
import { EvolutionOverlay } from '@/components/shared/EvolutionOverlay'
import { useGameState } from '@/hooks/useGameState'
import { Screen, SubScreen } from '@/types/game'
import { AchievementToast } from '@/components/shared/AchievementToast'
import { BottomNav } from '@/components/shared/BottomNav'
import { ProfileCreator } from '@/components/shared/ProfileCreator'
import { ProfileEditor } from '@/components/shared/ProfileEditor'
import { HomeScreen } from '@/components/screens/HomeScreen'
import { LevelSelectScreen } from '@/components/screens/LevelSelectScreen'
import { AchievementsScreen } from '@/components/screens/AchievementsScreen'
import { GameScreen } from '@/components/screens/GameScreen'
import { SessionCompleteScreen } from '@/components/screens/SessionCompleteScreen'
import { LevelCompleteScreen } from '@/components/screens/LevelCompleteScreen'

export default function MathGame() {
  const {
    profiles,
    setProfiles,
    activeProfile,
    activeProfileId,
    theme,
    switchProfile,
    updateProfile,
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
    startSession,
    handleDigit,
    handleBackspace,
    handleSubmit,
    toastAchievement,
    setToastAchievement,
    enqueueToast,
    pendingEvolution,
    clearPendingEvolution,
    pendingCompanionUnlock,
    clearPendingCompanionUnlock,
  } = useGameState()

  const companionStage = activeProfile?.companionStage ?? 0

  // Show companion toast after evolution dismissed (or immediately when no evolution pending).
  // useRef guard prevents a duplicate enqueue from React Strict Mode double-invocation.
  const companionToastFired = React.useRef(false)
  useEffect(() => {
    if (pendingCompanionUnlock && !pendingEvolution && !companionToastFired.current) {
      companionToastFired.current = true
      const ct = PRESET_THEMES.find(t => t.key === pendingCompanionUnlock)
      if (ct) {
        enqueueToast({
          id: `companion_${pendingCompanionUnlock}`,
          name: `${ct.label} Companion!`,
          description: 'New friend unlocked!',
          icon: ct.mascot,
        } as Achievement)
      }
      clearPendingCompanionUnlock()
    }
    if (!pendingCompanionUnlock) companionToastFired.current = false
  }, [pendingCompanionUnlock, pendingEvolution, enqueueToast, clearPendingCompanionUnlock])

  // ── Navigation ───────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('home')
  const [subScreen, setSubScreen] = useState<SubScreen>('none')
  const [editingProfile, setEditingProfile] = useState<ProfileSave | null>(null)

  // ── Transition to session-complete when hook sets sessionResult ───
  useEffect(() => {
    if (sessionResult && screen === 'playing') {
      setScreen('session-complete')
    }
  }, [sessionResult, screen])

  // ── Keyboard support ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (screen !== 'playing') return
      if (e.key >= '0' && e.key <= '9') handleDigit(Number(e.key))
      else if (e.key === 'Backspace') handleBackspace()
      else if (e.key === 'Enter') handleSubmit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [screen, handleDigit, handleBackspace, handleSubmit])

  // ── No profiles yet → show profile creator ────────────────
  if (profiles.length === 0 || !activeProfile) {
    return (
      <div className="relative w-full max-w-sm mx-auto min-h-screen overflow-x-hidden">
        <ProfileCreator
          onDone={(name, themeKey, readerMode, age) => {
            const newProfile = createProfile(name, themeKey, readerMode,
              age != null ? getStartingLevel(age) : 1)
            const newProfiles = [newProfile]
            setProfiles(newProfiles)
            saveProfiles(newProfiles)
            switchProfile(newProfile.profileId)
          }}
        />
      </div>
    )
  }

  // ── Helpers ───────────────────────────────────────────────
  const isMainScreen = screen === 'home' || screen === 'level-select' || screen === 'achievements'
  const bottomNavActive: 'home' | 'levels' | 'awards' =
    screen === 'level-select' ? 'levels' : screen === 'achievements' ? 'awards' : 'home'

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={`relative w-full max-w-sm mx-auto min-h-screen overflow-x-hidden ${isMainScreen ? 'pb-20' : ''}`}>
      {/* Evolution overlay — full-screen on companion stage-up */}
      {pendingEvolution !== null && (
        <EvolutionOverlay
          stage={pendingEvolution}
          theme={theme}
          onDismiss={clearPendingEvolution}
        />
      )}

      {/* Achievement toast overlay */}
      {toastAchievement && (
        <AchievementToast
          achievement={toastAchievement}
          onDone={() => setToastAchievement(null)}
        />
      )}

      {/* Profile editor modal (long-press) */}
      {subScreen === 'profile-edit' && editingProfile && (
        <ProfileEditor
          profile={editingProfile}
          canDelete={profiles.length > 1}
          onSave={updates => {
            updateProfile(editingProfile.profileId, prev => ({ ...prev, ...updates }))
            setSubScreen('none')
            setEditingProfile(null)
          }}
          onDelete={() => {
            const remaining = profiles.filter(p => p.profileId !== editingProfile.profileId)
            setProfiles(remaining)
            saveProfiles(remaining)
            if (activeProfileId === editingProfile.profileId && remaining.length > 0) {
              switchProfile(remaining[0].profileId)
            }
            setSubScreen('none')
            setEditingProfile(null)
          }}
          onCancel={() => {
            setSubScreen('none')
            setEditingProfile(null)
          }}
        />
      )}

      {/* ── Profile Create ── */}
      {subScreen === 'profile-create' && (
        <ProfileCreator
          onDone={(name, themeKey, readerMode, age) => {
            const newProfile = createProfile(name, themeKey, readerMode,
              age != null ? getStartingLevel(age) : 1)
            const newProfiles = [...profiles, newProfile]
            setProfiles(newProfiles)
            saveProfiles(newProfiles)
            switchProfile(newProfile.profileId)
            setSubScreen('none')
          }}
          onCancel={() => setSubScreen('none')}
        />
      )}

      {/* ── Home ── */}
      {screen === 'home' && subScreen === 'none' && (
        <HomeScreen
          profiles={profiles}
          activeProfile={activeProfile}
          theme={theme}
          companionStage={companionStage}
          onPlay={() => {
            const lvl = Math.min(activeProfile.highestUnlockedLevel, TOTAL_LEVELS)
            startSession(lvl)
            setScreen('playing')
          }}
          onSwitchProfile={id => switchProfile(id)}
          onAddProfile={() => setSubScreen('profile-create')}
          onLongPressProfile={profile => {
            setEditingProfile(profile)
            setSubScreen('profile-edit')
          }}
        />
      )}

      {/* ── Achievements ── */}
      {screen === 'achievements' && subScreen === 'none' && (
        <AchievementsScreen activeProfile={activeProfile} onBack={() => setScreen('home')} />
      )}

      {/* ── Level Select ── */}
      {screen === 'level-select' && (
        <LevelSelectScreen
          activeProfile={activeProfile}
          onSelect={(id) => { startSession(id); setScreen('playing') }}
          onBack={() => setScreen('home')}
        />
      )}

      {/* ── Playing ── */}
      {screen === 'playing' && activeLevel && (
        <GameScreen
          level={activeLevel}
          problems={problems}
          problemIndex={problemIndex}
          userAnswer={userAnswer}
          feedback={feedback}
          sessionCorrect={sessionCorrect}
          floatingStars={floatingStars}
          theme={theme}
          companionStage={companionStage}
          readerMode={activeProfile.readerMode}
          showDots={sessionShowDots}
          elapsedSec={sessionElapsedSec}
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          onQuit={() => { setScreen('home'); setSubScreen('none') }}
        />
      )}

      {/* ── Session Complete ── */}
      {screen === 'session-complete' && sessionResult && activeLevel && (
        <SessionCompleteScreen
          result={sessionResult}
          level={activeLevel}
          theme={theme}
          onContinue={() => {
            if (sessionResult.mastered) {
              const nextLevel = getLevelById(activeLevelId + 1)
              if (nextLevel) {
                setScreen('level-complete')
              } else {
                setScreen('home')
                setSubScreen('none')
              }
            } else {
              setScreen('home')
              setSubScreen('none')
            }
          }}
          onRetry={() => { startSession(activeLevelId); setScreen('playing') }}
          onNextLevel={() => {
            const nextId = activeLevelId + 1
            const nextLevel = getLevelById(nextId)
            if (nextLevel) {
              startSession(nextId)
              setScreen('playing')
            } else {
              setScreen('home')
            }
          }}
        />
      )}

      {/* ── Level Complete ── */}
      {screen === 'level-complete' && activeLevel && (
        <LevelCompleteScreen
          level={activeLevel}
          nextLevel={getLevelById(activeLevelId + 1) ?? null}
          theme={theme}
          onContinue={() => {
            const nextId = activeLevelId + 1
            const nextLevel = getLevelById(nextId)
            if (nextLevel) {
              startSession(nextId)
              setScreen('playing')
            } else {
              setScreen('home')
              setSubScreen('none')
            }
          }}
        />
      )}

      {/* ── Bottom Nav (main screens only) ── */}
      {isMainScreen && subScreen === 'none' && (
        <BottomNav
          active={bottomNavActive}
          onHome={() => { setScreen('home'); setSubScreen('none') }}
          onLevels={() => setScreen('level-select')}
          onAwards={() => setScreen('achievements')}
        />
      )}
    </div>
  )
}
