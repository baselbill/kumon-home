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
import { LessonIntroScreen } from '@/components/screens/LessonIntroScreen'
import { getLessonForLevel } from '@/lib/lessons'
import { SessionCompleteScreen } from '@/components/screens/SessionCompleteScreen'
import { LevelCompleteScreen } from '@/components/screens/LevelCompleteScreen'
import { WorldScreen } from '@/components/screens/WorldScreen'
import { ShopScreen } from '@/components/screens/ShopScreen'
import { CatalogItem } from '@/lib/catalog'
import { ParentPinScreen } from '@/components/screens/ParentPinScreen'
import { ParentDashboardScreen } from '@/components/screens/ParentDashboardScreen'
import { ParentProgressScreen } from '@/components/screens/ParentProgressScreen'
import { ParentSettingsScreen } from '@/components/screens/ParentSettingsScreen'
import { getParentPin } from '@/lib/parentPin'

const THEME_COLOR: Record<string, string> = {
  dinosaurs: '#F97316', space: '#818CF8', ocean: '#06B6D4', jungle: '#22C55E',
  unicorns: '#E879F9', robots: '#38BDF8', cats: '#FB7185',
}

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
    availableStars,
    buyAndPlace,
    removeWorldItem,
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
  const [pendingWorldItem, setPendingWorldItem] = useState<CatalogItem | null>(null)
  const [parentViewingProfileId, setParentViewingProfileId] = useState<string | null>(null)
  // Level awaiting its concept-intro lesson before practice starts.
  const [pendingLevelId, setPendingLevelId] = useState<number | null>(null)

  // ── Begin a level: show the concept intro the first time, else play ───
  const beginLevel = useCallback((levelId: number) => {
    const lesson = getLessonForLevel(levelId, theme)
    const seen = activeProfile?.seenIntros ?? []
    if (lesson && !seen.includes(levelId)) {
      setPendingLevelId(levelId)
      setScreen('lesson-intro')
    } else {
      startSession(levelId)
      setScreen('playing')
    }
  }, [theme, activeProfile, startSession])

  // ── Reopen a concept intro on demand (e.g. "Learn it again") ──────────
  const reviewLesson = useCallback((levelId: number) => {
    setPendingLevelId(levelId)
    setScreen('lesson-intro')
  }, [])

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

  // Derived theme + level colors for CSS vars
  const themeColor = THEME_COLOR[theme?.key ?? ''] ?? '#FBBF24'
  const levelColor = activeLevel?.color ?? themeColor

  const rootStyle = {
    '--theme-color': themeColor,
    '--level-color': levelColor,
  } as React.CSSProperties

  // ── No profiles yet → show profile creator ────────────────
  if (profiles.length === 0 || !activeProfile) {
    return (
      <div className="app-root" data-vd="midnight" style={rootStyle}>
        <div className="ambient">
          <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="grain" />
        </div>
        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
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
      </div>
    )
  }

  // ── Helpers ───────────────────────────────────────────────
  const isMainScreen = screen === 'home' || screen === 'level-select' || screen === 'achievements' || screen === 'world'
  const bottomNavActive: 'home' | 'levels' | 'world' | 'awards' =
    screen === 'level-select' ? 'levels' : screen === 'achievements' ? 'awards' : screen === 'world' ? 'world' : 'home'

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="app-root" data-vd="midnight" style={rootStyle}>
      {/* Ambient aurora */}
      <div className="ambient">
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="grain" />
      </div>

      {/* Evolution overlay */}
      {pendingEvolution !== null && (
        <EvolutionOverlay
          stage={pendingEvolution}
          theme={theme}
          onDismiss={clearPendingEvolution}
        />
      )}

      {/* Achievement toast */}
      {toastAchievement && (
        <AchievementToast
          achievement={toastAchievement}
          onDone={() => setToastAchievement(null)}
        />
      )}

      {/* Stage — scrollable screen area */}
      <div className="stage">

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
          availableStars={availableStars}
          onPlay={() => {
            const lvl = Math.min(activeProfile.highestUnlockedLevel, TOTAL_LEVELS)
            beginLevel(lvl)
          }}
          onSwitchProfile={id => switchProfile(id)}
          onAddProfile={() => setSubScreen('profile-create')}
          onLongPressProfile={profile => {
            setEditingProfile(profile)
            setSubScreen('profile-edit')
          }}
          onOpenWorld={() => setScreen('world')}
          onOpenParent={() => setScreen(getParentPin() !== null ? 'parent-pin' : 'parent-dashboard')}
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
          theme={theme}
          onSelect={(id) => beginLevel(id)}
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

      {/* ── Lesson Intro (concept launch before practice) ── */}
      {screen === 'lesson-intro' && pendingLevelId !== null && getLevelById(pendingLevelId) && (
        <LessonIntroScreen
          level={getLevelById(pendingLevelId)!}
          theme={theme}
          onStart={() => {
            const levelId = pendingLevelId
            const seen = activeProfile.seenIntros ?? []
            if (!seen.includes(levelId)) {
              updateProfile(activeProfileId, prev => ({
                ...prev,
                seenIntros: [...(prev.seenIntros ?? []), levelId],
              }))
            }
            startSession(levelId)
            setPendingLevelId(null)
            setScreen('playing')
          }}
          onExit={() => { setPendingLevelId(null); setScreen('home'); setSubScreen('none') }}
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
              beginLevel(nextId)
            } else {
              setScreen('home')
            }
          }}
          onReviewLesson={
            getLessonForLevel(activeLevelId, theme) ? () => reviewLesson(activeLevelId) : undefined
          }
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
              beginLevel(nextId)
            } else {
              setScreen('home')
              setSubScreen('none')
            }
          }}
        />
      )}

      {/* ── Parent PIN (verify existing) ── */}
      {screen === 'parent-pin' && (
        <ParentPinScreen
          mode="verify"
          onSuccess={() => setScreen('parent-dashboard')}
          onCancel={() => setScreen('home')}
        />
      )}

      {/* ── Parent PIN (set/change) ── */}
      {screen === 'parent-pin-set' && (
        <ParentPinScreen
          mode="set"
          onSuccess={() => setScreen('parent-settings')}
          onCancel={() => setScreen('parent-settings')}
        />
      )}

      {/* ── Parent Dashboard ── */}
      {screen === 'parent-dashboard' && (
        <ParentDashboardScreen
          profiles={profiles}
          onViewProgress={id => { setParentViewingProfileId(id); setScreen('parent-progress') }}
          onViewSettings={id => { setParentViewingProfileId(id); setScreen('parent-settings') }}
          onClose={() => setScreen('home')}
        />
      )}

      {/* ── Parent Progress ── */}
      {screen === 'parent-progress' && (() => {
        const p = profiles.find(x => x.profileId === parentViewingProfileId)
        if (!p) return null
        return (
          <ParentProgressScreen
            profile={p}
            onBack={() => setScreen('parent-dashboard')}
          />
        )
      })()}

      {/* ── Parent Settings ── */}
      {screen === 'parent-settings' && (
        <ParentSettingsScreen
          profiles={profiles}
          onUpdateProfile={updateProfile}
          onBack={() => setScreen('parent-dashboard')}
          onChangePIN={() => setScreen('parent-pin-set')}
        />
      )}

      {/* ── World ── */}
      {screen === 'world' && subScreen === 'none' && (
        <WorldScreen
          activeProfile={activeProfile}
          theme={theme}
          availableStars={availableStars}
          pendingItem={pendingWorldItem}
          onBuyAndPlace={(item, x, y) => buyAndPlace(item, x, y)}
          onRemove={(x, y) => removeWorldItem(x, y)}
          onOpenShop={() => setScreen('shop')}
          onCancelPending={() => setPendingWorldItem(null)}
          onBack={() => setScreen('home')}
        />
      )}

      {/* ── Shop ── */}
      {screen === 'shop' && subScreen === 'none' && (
        <ShopScreen
          theme={theme}
          availableStars={availableStars}
          onSelectItem={item => {
            setPendingWorldItem(item)
            setScreen('world')
          }}
          onBack={() => setScreen('world')}
        />
      )}

      </div>{/* end .stage */}

      {/* Bottom Nav — outside stage, rendered as flex child of app-root */}
      {isMainScreen && subScreen === 'none' && (
        <BottomNav
          active={bottomNavActive}
          onHome={() => { setScreen('home'); setSubScreen('none') }}
          onLevels={() => setScreen('level-select')}
          onWorld={() => setScreen('world')}
          onAwards={() => setScreen('achievements')}
        />
      )}
    </div>
  )
}
