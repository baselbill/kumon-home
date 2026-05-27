'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { CURRICULUM, getLevelById, getStartingLevel, Level, TOTAL_LEVELS } from '@/lib/curriculum'
import { Problem, generateSession, narrate } from '@/lib/problems'
import {
  LevelProgress,
  ProfileSave,
  loadProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId as persistActiveProfileId,
  createProfile,
  updateStreak,
  checkNewAchievements,
  ALL_ACHIEVEMENTS,
  Achievement,
} from '@/lib/storage'
import { Theme, PRESET_THEMES, resolveTheme } from '@/lib/themes'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type Screen = 'home' | 'level-select' | 'playing' | 'session-complete' | 'level-complete'
type SubScreen = 'none' | 'achievements' | 'profile-create' | 'profile-edit'
type FeedbackState = 'none' | 'correct' | 'wrong'

interface ProblemAttempt {
  problemIndex: number
  correct: boolean
  responseTimeMs: number
  operand1: number
  operand2: number | null
  operator: Problem['operator']
}

interface SessionResult {
  levelId: number
  correct: number
  total: number
  mastered: boolean
  isPerfect: boolean
  starsEarned: number
  newAchievements: string[]
  adaptiveBanner: boolean  // show "Level Up?" hint (only when mastery NOT triggered)
}

// ─────────────────────────────────────────────────────────────
// Sound effects via Web Audio API
// ─────────────────────────────────────────────────────────────
function createAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)()
  } catch {
    return null
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  gain = 0.25,
  type: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt)
  gainNode.gain.setValueAtTime(gain, ctx.currentTime + startAt)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration)
  osc.start(ctx.currentTime + startAt)
  osc.stop(ctx.currentTime + startAt + duration + 0.05)
}

/** Theme-aware correct-answer sound. */
function playCorrectSound(soundStyle: Theme['soundStyle'] = 'chime') {
  const ctx = createAudioCtx()
  if (!ctx) return
  switch (soundStyle) {
    case 'roar':
      playTone(ctx, 220, 0, 0.12, 0.3, 'sawtooth')
      playTone(ctx, 350, 0.1, 0.2, 0.25, 'sawtooth')
      playTone(ctx, 523.25, 0.22, 0.3, 0.2)
      break
    case 'laser':
      playTone(ctx, 440, 0, 0.08, 0.2, 'square')
      playTone(ctx, 660, 0.07, 0.08, 0.18, 'square')
      playTone(ctx, 880, 0.14, 0.1, 0.16, 'square')
      playTone(ctx, 1100, 0.22, 0.15, 0.14, 'square')
      break
    case 'splash':
      playTone(ctx, 392, 0, 0.18, 0.15)
      playTone(ctx, 523.25, 0.12, 0.22, 0.12)
      playTone(ctx, 440, 0.25, 0.28, 0.1)
      break
    case 'chime':
      // Default arpeggio: C5 → E5 → G5
      playTone(ctx, 523.25, 0, 0.25)
      playTone(ctx, 659.25, 0.12, 0.25)
      playTone(ctx, 783.99, 0.24, 0.35)
      break
    case 'pop':
      playTone(ctx, 600, 0, 0.06, 0.15, 'square')
      playTone(ctx, 800, 0.06, 0.06, 0.12, 'square')
      playTone(ctx, 1000, 0.12, 0.08, 0.1, 'square')
      break
    default:
      playTone(ctx, 523.25, 0, 0.25)
      playTone(ctx, 659.25, 0.12, 0.25)
      playTone(ctx, 783.99, 0.24, 0.35)
  }
}

function playWrongSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  playTone(ctx, 350, 0, 0.12, 0.2)
  playTone(ctx, 280, 0.1, 0.22, 0.2)
}

function playLevelCompleteSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5]
  notes.forEach((f, i) => playTone(ctx, f, i * 0.14, 0.4, 0.22))
}

function playTapSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  playTone(ctx, 800, 0, 0.06, 0.08, 'square')
}

// ─────────────────────────────────────────────────────────────
// Dot display (visual counting helper) — themed emoji version
// ─────────────────────────────────────────────────────────────

function DotsDisplay({ problem, theme }: { problem: Problem; theme: Theme }) {
  // Constrain bounding box so emoji aspect-ratio variation across OS/browsers
  // doesn't break the grid layout.
  const dotSize = problem.operand1 > 10 ? 20 : problem.operand1 > 5 ? 22 : 26
  const dotStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dotSize,
    height: dotSize,
    fontSize: dotSize * 0.85,
    lineHeight: 1,
    flexShrink: 0,
  }
  const gridWidth = `${dotSize * 5 + 4 * 4}px`

  if (problem.type === 'counting') {
    return (
      <div className="flex justify-center mt-4">
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: gridWidth }}>
          {Array.from({ length: problem.operand1 }).map((_, i) => (
            <span key={i} style={dotStyle}>{theme.dotEmoji}</span>
          ))}
        </div>
      </div>
    )
  }

  if (problem.type === 'addition' && problem.operand2 !== null) {
    return (
      <div className="flex items-center gap-4 justify-center mt-4 flex-wrap">
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: gridWidth }}>
          {Array.from({ length: problem.operand1 }).map((_, i) => (
            <span key={i} style={dotStyle}>{theme.dotEmoji}</span>
          ))}
        </div>
        <span className="text-3xl font-bold text-gray-500">+</span>
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: gridWidth }}>
          {Array.from({ length: problem.operand2 }).map((_, i) => (
            <span key={i} style={dotStyle}>{theme.dotEmoji}</span>
          ))}
        </div>
      </div>
    )
  }

  if (problem.type === 'subtraction' && problem.operand2 !== null) {
    const kept = problem.operand1 - problem.operand2
    return (
      <div className="flex items-center gap-3 justify-center mt-4 flex-wrap">
        {/* All operand1 dots: theme emoji for kept, ❌ for removed */}
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: `${dotSize * 6 + 5 * 4}px` }}>
          {Array.from({ length: problem.operand1 }).map((_, i) => (
            <span key={i} style={{ ...dotStyle, opacity: i < kept ? 1 : 0.5 }}>
              {i < kept ? theme.dotEmoji : '❌'}
            </span>
          ))}
        </div>
        <span className="text-3xl font-bold text-gray-500">−</span>
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: gridWidth }}>
          {Array.from({ length: problem.operand2 }).map((_, i) => (
            <span key={i} style={dotStyle}>❌</span>
          ))}
        </div>
      </div>
    )
  }

  return null
}

// ─────────────────────────────────────────────────────────────
// Number Pad
// ─────────────────────────────────────────────────────────────
function NumberPad({
  onDigit,
  onBackspace,
  onSubmit,
  disabled,
}: {
  onDigit: (d: number) => void
  onBackspace: () => void
  onSubmit: () => void
  disabled: boolean
}) {
  const btn =
    'numpad-btn flex items-center justify-center rounded-2xl font-bold text-white shadow-md active:shadow-inner transition-transform select-none cursor-pointer'

  const handleDigit = (d: number) => {
    if (!disabled) { playTapSound(); onDigit(d) }
  }
  const handleBack = () => { if (!disabled) { playTapSound(); onBackspace() } }
  const handleOk = () => { if (!disabled) onSubmit() }

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {[1,2,3,4,5,6,7,8,9].map(d => (
        <button
          key={d}
          onClick={() => handleDigit(d)}
          disabled={disabled}
          className={`${btn} bg-blue-500 hover:bg-blue-600 text-4xl h-16`}
          style={{ fontSize: '1.8rem' }}
        >
          {d}
        </button>
      ))}
      <button
        onClick={handleBack}
        disabled={disabled}
        className={`${btn} bg-gray-400 hover:bg-gray-500 h-16 text-2xl`}
      >
        ⌫
      </button>
      <button
        onClick={() => handleDigit(0)}
        disabled={disabled}
        className={`${btn} bg-blue-500 hover:bg-blue-600 h-16`}
        style={{ fontSize: '1.8rem' }}
      >
        0
      </button>
      <button
        onClick={handleOk}
        disabled={disabled}
        className={`${btn} bg-green-500 hover:bg-green-600 h-16 text-2xl`}
      >
        ✓
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Progress dots (top of game screen)
// ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: total > 15 ? 10 : 14,
            height: total > 15 ? 10 : 14,
            backgroundColor: i < current ? '#22C55E' : i === current ? '#FBBF24' : '#D1D5DB',
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Floating star reward animation
// ─────────────────────────────────────────────────────────────
interface FloatingStar { id: number; x: number; y: number }

// ─────────────────────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#FF6B6B','#FFE66D','#6BCB77','#4D96FF','#FF6BFF','#FF9F1C']

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 8 + Math.random() * 10,
    delay: Math.random() * 1.5,
    duration: 1.8 + Math.random() * 1.4,
  }))

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// Achievement toast
// ─────────────────────────────────────────────────────────────
function AchievementToast({
  achievement,
  onDone,
}: {
  achievement: Achievement
  onDone: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
      <div className="bg-yellow-400 text-gray-900 rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3 border-2 border-yellow-600">
        <span className="text-3xl">{achievement.icon}</span>
        <div>
          <div className="font-bold text-lg leading-tight">Achievement unlocked!</div>
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-sm opacity-75">{achievement.description}</div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Mascot — themed character, mood-aware
// ─────────────────────────────────────────────────────────────
function Mascot({ mood, theme }: { mood: 'idle' | 'happy' | 'thinking' | 'celebrate'; theme: Theme }) {
  // idle → theme mascot; emotional states use expressive emoji
  const face =
    mood === 'happy'     ? '🤩' :
    mood === 'thinking'  ? '🤔' :
    mood === 'celebrate' ? '🥳' :
    theme.mascot

  return (
    <div
      className={`text-6xl select-none transition-transform duration-300 ${
        mood === 'happy' || mood === 'celebrate' ? 'animate-bounce' : ''
      }`}
    >
      {face}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Toggle switch (shared UI primitive)
// ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 ${on ? 'bg-purple-500' : 'bg-gray-300'}`}
      role="switch"
      aria-checked={on}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${on ? 'left-5' : 'left-0.5'}`}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Profile Creator — parent-only screen
// ─────────────────────────────────────────────────────────────
function ProfileCreator({
  onDone,
  onCancel,
}: {
  onDone: (name: string, themeKey: string, readerMode: boolean, age?: number) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState('')
  const [themeKey, setThemeKey] = useState(PRESET_THEMES[0].key)
  const [readerMode, setReaderMode] = useState(false)
  const [age, setAge] = useState<number | null>(null)

  const selectedTheme = PRESET_THEMES.find(t => t.key === themeKey) ?? PRESET_THEMES[0]
  const startLevel = age != null ? getStartingLevel(age) : null
  const startLevelName = startLevel != null ? (getLevelById(startLevel)?.name ?? 'Math Master') : null

  return (
    <div className="flex flex-col gap-5 p-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">Add a Player</div>
        <div className="text-sm text-gray-500 mt-1">Parents set this up</div>
      </div>

      {/* Name input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Player name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Emma"
          maxLength={20}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400"
          autoComplete="off"
        />
      </div>

      {/* Age stepper — sets the starting level */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Age{' '}
          <span className="text-gray-400 font-normal">(optional — skips too-easy levels)</span>
        </label>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <button
            onClick={() => setAge(a => a == null ? null : Math.max(4, a - 1))}
            disabled={age == null || age <= 4}
            className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 text-xl font-bold text-gray-600 flex items-center justify-center active:scale-95 disabled:opacity-30"
          >−</button>
          <div className="flex-1 text-center">
            {age != null ? (
              <span className="text-3xl font-bold text-gray-800">{age}</span>
            ) : (
              <button
                onClick={() => setAge(6)}
                className="text-sm text-purple-500 font-semibold underline underline-offset-2"
              >
                Tap to set age
              </button>
            )}
          </div>
          <button
            onClick={() => setAge(a => Math.min(16, (a ?? 5) + 1))}
            disabled={age != null && age >= 16}
            className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 text-xl font-bold text-gray-600 flex items-center justify-center active:scale-95 disabled:opacity-30"
          >+</button>
        </div>
        <div className="mt-1.5 text-center text-xs min-h-[1.1rem]">
          {startLevelName != null ? (
            <span className="text-purple-600 font-medium">Starts at: {startLevelName}</span>
          ) : (
            <span className="text-gray-400">Starts at level 1 if age not set</span>
          )}
        </div>
      </div>

      {/* Theme picker — emoji grid, no reading required */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Choose a world</label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_THEMES.map(t => (
            <button
              key={t.key}
              onClick={() => setThemeKey(t.key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                themeKey === t.key
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span className="text-2xl">{t.mascot}</span>
              <span className="text-xs font-medium text-gray-600 leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reader mode toggle */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
        <div>
          <div className="font-semibold text-gray-800">
            Can {name.trim() || 'this player'} read yet?
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Adds story sentences</div>
        </div>
        <Toggle on={readerMode} onChange={setReaderMode} />
      </div>

      {/* Done button */}
      <button
        onClick={() => {
          const trimmed = name.trim()
          if (trimmed) onDone(trimmed, themeKey, readerMode, age ?? undefined)
        }}
        disabled={!name.trim()}
        className="w-full py-4 text-xl font-bold rounded-2xl text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform shadow-lg"
      >
        Let&apos;s play! {selectedTheme.mascot}
      </button>

      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full py-2 text-sm font-semibold text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Profile Editor modal — shown on long-press of avatar chip
// ─────────────────────────────────────────────────────────────
function ProfileEditor({
  profile,
  canDelete,
  onSave,
  onDelete,
  onCancel,
}: {
  profile: ProfileSave
  canDelete: boolean
  onSave: (updates: Pick<ProfileSave, 'profileName' | 'themeKey' | 'readerMode'>) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(profile.profileName)
  const [themeKey, setThemeKey] = useState(profile.themeKey)
  const [readerMode, setReaderMode] = useState(profile.readerMode)
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    let finalThemeKey = themeKey
    if (showCustom && customText.trim()) {
      finalThemeKey = resolveTheme(customText).key
    }
    onSave({
      profileName: name.trim() || profile.profileName,
      themeKey: finalThemeKey,
      readerMode,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-t-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-xl font-bold text-gray-800 mb-4">Edit Player</div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-base focus:outline-none focus:border-purple-400"
            autoComplete="off"
          />
        </div>

        {/* Theme grid */}
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">World</label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_THEMES.map(t => (
              <button
                key={t.key}
                onClick={() => { setThemeKey(t.key); setShowCustom(false) }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  themeKey === t.key && !showCustom
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <span className="text-2xl">{t.mascot}</span>
                <span className="text-xs font-medium text-gray-600 leading-tight text-center">{t.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCustom(s => !s)}
            className="mt-2 text-sm text-purple-600 font-semibold"
          >
            {showCustom ? '▼' : '▶'} Custom theme
          </button>
          {showCustom && (
            <input
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder='e.g. "ninja cats" or "pirates"'
              className="w-full mt-2 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400"
              autoComplete="off"
            />
          )}
        </div>

        {/* Reader mode */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-4">
          <div>
            <div className="font-semibold text-gray-800">
              Can {name.trim() || 'this player'} read yet?
            </div>
            <div className="text-xs text-gray-500">Story sentences</div>
          </div>
          <Toggle on={readerMode} onChange={setReaderMode} />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3 text-lg font-bold rounded-2xl text-white bg-purple-500 hover:bg-purple-600 active:scale-95 transition-transform shadow mb-3"
        >
          Save changes
        </button>

        {/* Delete */}
        {canDelete && (
          showDeleteConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold"
              >
                Keep
              </button>
              <button
                onClick={onDelete}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold"
              >
                Delete!
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 text-red-400 font-semibold text-sm"
            >
              Delete player…
            </button>
          )
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Home Screen — with profile chips + long-press to edit
// ─────────────────────────────────────────────────────────────
function HomeScreen({
  profiles,
  activeProfile,
  theme,
  onPlay,
  onSelectLevel,
  onViewAchievements,
  onSwitchProfile,
  onAddProfile,
  onLongPressProfile,
}: {
  profiles: ProfileSave[]
  activeProfile: ProfileSave
  theme: Theme
  onPlay: () => void
  onSelectLevel: () => void
  onViewAchievements: () => void
  onSwitchProfile: (id: string) => void
  onAddProfile: () => void
  onLongPressProfile: (profile: ProfileSave) => void
}) {
  const highestLevel = getLevelById(activeProfile.highestUnlockedLevel)
  const allDone = activeProfile.highestUnlockedLevel > TOTAL_LEVELS

  // Long-press implementation via touch + mouse events (longpress is not a DOM event)
  const longPressTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const startLongPress = (profile: ProfileSave) => {
    longPressTimers.current[profile.profileId] = setTimeout(() => {
      onLongPressProfile(profile)
    }, 500)
  }

  const cancelLongPress = (profileId: string) => {
    if (longPressTimers.current[profileId]) {
      clearTimeout(longPressTimers.current[profileId])
      delete longPressTimers.current[profileId]
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-sm mx-auto text-center">

      {/* Profile chips */}
      <div className="flex gap-2 flex-wrap justify-center w-full">
        {profiles.map(p => {
          const pTheme = PRESET_THEMES.find(t => t.key === p.themeKey) ?? PRESET_THEMES[0]
          const isActive = p.profileId === activeProfile.profileId
          return (
            <button
              key={p.profileId}
              onClick={() => onSwitchProfile(p.profileId)}
              onTouchStart={() => startLongPress(p)}
              onTouchEnd={() => cancelLongPress(p.profileId)}
              onTouchCancel={() => cancelLongPress(p.profileId)}
              onMouseDown={() => startLongPress(p)}
              onMouseUp={() => cancelLongPress(p.profileId)}
              onMouseLeave={() => cancelLongPress(p.profileId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all text-sm font-semibold select-none ${
                isActive
                  ? 'border-purple-500 bg-purple-100 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <span>{pTheme.mascot}</span>
              <span>{p.profileName}</span>
            </button>
          )
        })}
        <button
          onClick={onAddProfile}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-dashed border-gray-300 text-gray-400 text-sm hover:border-gray-400"
        >
          + Add
        </button>
      </div>

      {/* Header */}
      <div className="text-4xl font-bold text-purple-700 leading-tight mt-2">
        Math Adventure!
      </div>

      {/* Themed mascot */}
      <Mascot mood="idle" theme={theme} />

      {/* Stats row */}
      <div className="flex gap-4 justify-center w-full">
        <div className="flex-1 bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-3">
          <div className="text-2xl">⭐</div>
          <div className="text-2xl font-bold text-yellow-600">{activeProfile.totalStars}</div>
          <div className="text-xs text-gray-500">Stars</div>
        </div>
        <div className="flex-1 bg-orange-100 border-2 border-orange-300 rounded-2xl p-3">
          <div className="text-2xl">🔥</div>
          <div className="text-2xl font-bold text-orange-500">{activeProfile.streak}</div>
          <div className="text-xs text-gray-500">Day streak</div>
        </div>
        <div className="flex-1 bg-purple-100 border-2 border-purple-300 rounded-2xl p-3">
          <div className="text-2xl">{highestLevel?.icon ?? '🏆'}</div>
          <div className="text-2xl font-bold text-purple-600">
            {allDone ? '✓' : activeProfile.highestUnlockedLevel}
          </div>
          <div className="text-xs text-gray-500">
            {allDone ? 'Done!' : 'Level'}
          </div>
        </div>
      </div>

      {/* Current level card */}
      {!allDone && highestLevel && (
        <div
          className="w-full rounded-2xl p-4 text-white shadow-lg"
          style={{ backgroundColor: highestLevel.color }}
        >
          <div className="text-3xl mb-1">{highestLevel.icon}</div>
          <div className="font-bold text-lg">{highestLevel.name}</div>
          <div className="text-sm opacity-90">{highestLevel.description}</div>
        </div>
      )}

      {allDone && (
        <div className="w-full rounded-2xl p-4 bg-yellow-400 text-gray-900 shadow-lg">
          <div className="text-3xl mb-1">🏆</div>
          <div className="font-bold text-lg">You finished all levels!</div>
          <div className="text-sm">{theme.celebrationLine}</div>
        </div>
      )}

      {/* Buttons */}
      <button
        onClick={onPlay}
        className="w-full py-4 text-2xl font-bold rounded-2xl text-white shadow-lg bg-green-500 hover:bg-green-600 active:scale-95 transition-transform"
      >
        {allDone ? '🔄 Play Again' : '▶ Play!'}
      </button>

      <div className="flex gap-3 w-full">
        <button
          onClick={onSelectLevel}
          className="flex-1 py-3 text-base font-bold rounded-xl text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-transform"
        >
          📚 Levels
        </button>
        <button
          onClick={onViewAchievements}
          className="flex-1 py-3 text-base font-bold rounded-xl text-white bg-purple-500 hover:bg-purple-600 active:scale-95 transition-transform"
        >
          🏅 Awards
        </button>
      </div>

      <div className="text-xs text-gray-400 pb-2">
        Hold an avatar to edit • Tap to switch player
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Level Select Screen
// ─────────────────────────────────────────────────────────────
function LevelSelectScreen({
  activeProfile,
  onSelect,
  onBack,
}: {
  activeProfile: ProfileSave
  onSelect: (levelId: number) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-2xl p-2 rounded-xl active:scale-90 transition-transform">⬅</button>
        <div className="text-2xl font-bold text-gray-700">Choose a Level</div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-6">
        {CURRICULUM.map(level => {
          const unlocked = level.id <= activeProfile.highestUnlockedLevel
          const prog = activeProfile.levelProgress[level.id]
          const completed = prog?.completed ?? false

          return (
            <button
              key={level.id}
              onClick={() => unlocked && onSelect(level.id)}
              disabled={!unlocked}
              className={`rounded-2xl p-4 text-left shadow transition-transform ${
                unlocked ? 'active:scale-95 cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
              style={{
                backgroundColor: unlocked ? level.color : '#E5E7EB',
                color: unlocked ? 'white' : '#9CA3AF',
              }}
            >
              <div className="text-3xl mb-1">{unlocked ? level.icon : '🔒'}</div>
              <div className="font-bold text-sm leading-tight">{level.name}</div>
              {completed && (
                <div className="text-xs mt-1 font-semibold opacity-90">✅ Mastered!</div>
              )}
              {!completed && unlocked && prog && (
                <div className="text-xs mt-1 opacity-80">
                  Best: {prog.bestScore}/{level.problemsPerSession}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Achievements Screen
// ─────────────────────────────────────────────────────────────
function AchievementsScreen({ activeProfile, onBack }: { activeProfile: ProfileSave; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-sm mx-auto pb-8">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-2xl p-2 rounded-xl active:scale-90 transition-transform">⬅</button>
        <div className="text-2xl font-bold text-gray-700">Achievements</div>
      </div>
      <div className="flex flex-col gap-3">
        {ALL_ACHIEVEMENTS.map(a => {
          const earned = activeProfile.achievements.includes(a.id)
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-2xl p-4 shadow ${
                earned ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-100 opacity-50'
              }`}
            >
              <div className="text-3xl">{earned ? a.icon : '🔒'}</div>
              <div>
                <div className="font-bold text-gray-800">{a.name}</div>
                <div className="text-sm text-gray-500">{a.description}</div>
              </div>
              {earned && <div className="ml-auto text-yellow-500 font-bold">✓</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Problem equation display — handles all LevelType layouts
// ─────────────────────────────────────────────────────────────
function ProblemEquation({ problem }: { problem: Problem }) {
  const big = 'text-5xl font-bold text-gray-800'
  const opr = 'text-4xl font-bold text-gray-500 mx-3'
  const eq  = 'text-4xl font-bold text-gray-400 mx-3'

  if (problem.type === 'counting') {
    return (
      <div className="text-center text-2xl font-bold text-gray-600 mb-2">
        How many?
      </div>
    )
  }

  if (problem.type === 'exponent') {
    return (
      <div className="text-center mb-2 flex items-start justify-center gap-0.5">
        <span className={big}>{problem.operand1}</span>
        <sup className="text-2xl font-bold text-gray-800 mt-1 ml-0.5">{problem.operand2}</sup>
        <span className={eq}>=</span>
      </div>
    )
  }

  if (problem.type === 'sqrt') {
    return (
      <div className="text-center mb-2">
        <span className="text-5xl font-bold text-gray-800">√{problem.operand1}</span>
        <span className={eq}>=</span>
      </div>
    )
  }

  if (problem.type === 'percentage') {
    return (
      <div className="text-center mb-2 flex items-center justify-center flex-wrap">
        <span className={big}>{problem.operand1}%</span>
        <span className={opr}>of</span>
        <span className={big}>{problem.operand2}</span>
        <span className={eq}>=</span>
      </div>
    )
  }

  if (problem.type === 'algebra' && problem.displayText) {
    return (
      <div className="text-center mb-2">
        <div className="text-4xl font-bold text-gray-800">{problem.displayText}</div>
        <div className="text-xl text-gray-500 mt-1">x = ?</div>
      </div>
    )
  }

  // Default: addition, subtraction, multiplication, division
  return (
    <div className="text-center mb-2">
      <span className={big}>{problem.operand1}</span>
      <span className={opr}>{problem.operator}</span>
      {problem.operand2 !== null && <span className={big}>{problem.operand2}</span>}
      <span className={eq}>=</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Game Screen (the main playing view)
// ─────────────────────────────────────────────────────────────
function GameScreen({
  level,
  problems,
  problemIndex,
  userAnswer,
  feedback,
  sessionCorrect,
  floatingStars,
  theme,
  readerMode,
  showDots,
  onDigit,
  onBackspace,
  onSubmit,
}: {
  level: Level
  problems: Problem[]
  problemIndex: number
  userAnswer: string
  feedback: FeedbackState
  sessionCorrect: number
  floatingStars: FloatingStar[]
  theme: Theme
  readerMode: boolean
  showDots: boolean
  onDigit: (d: number) => void
  onBackspace: () => void
  onSubmit: () => void
}) {
  const problem = problems[problemIndex]
  if (!problem) return null

  const isCorrect = feedback === 'correct'
  const isWrong   = feedback === 'wrong'

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto px-4 pt-4 pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div
          className="px-3 py-1 rounded-xl text-white text-sm font-bold"
          style={{ backgroundColor: level.color }}
        >
          {level.icon} {level.name}
        </div>
        <div className="flex items-center gap-1 text-yellow-500 font-bold">
          ⭐ {sessionCorrect}
        </div>
      </div>

      {/* Progress dots */}
      <ProgressDots total={level.problemsPerSession} current={problemIndex} />

      {/* Problem card */}
      <div
        className={`rounded-3xl p-6 shadow-lg transition-all duration-200 ${
          isCorrect ? 'bg-green-50 border-4 border-green-400' :
          isWrong   ? 'bg-red-50 border-4 border-red-300' :
          'bg-white border-4 border-gray-100'
        }`}
        style={{ minHeight: '200px', position: 'relative' }}
      >
        {/* Floating stars */}
        {floatingStars.map(s => (
          <div
            key={s.id}
            className="float-star"
            style={{ left: `${s.x}%`, bottom: '60%' }}
          >
            ⭐
          </div>
        ))}

        {/* Themed mascot */}
        <div className="flex justify-center mb-3">
          <Mascot
            mood={isCorrect ? 'happy' : isWrong ? 'thinking' : 'idle'}
            theme={theme}
          />
        </div>

        {/* Problem text: narrated sentence for readers, equation for non-readers */}
        {readerMode ? (
          <div className="text-center text-xl font-semibold text-gray-700 mb-2 leading-snug">
            {narrate(problem, theme)}
          </div>
        ) : (
          <ProblemEquation problem={problem} />
        )}

        {/* Themed dot display */}
        {showDots && <DotsDisplay problem={problem} theme={theme} />}

        {/* Feedback message */}
        {isCorrect && (
          <div className="text-center mt-3 text-green-600 font-bold text-xl animate-bounce-in">
            {theme.shortFeedback} 🎉
          </div>
        )}
        {isWrong && (
          <div className="text-center mt-3 animate-bounce-in">
            <div className="text-orange-500 font-bold text-lg">The answer is…</div>
            <div className="text-5xl font-bold text-orange-600 mt-1">{problem.answer}</div>
          </div>
        )}
      </div>

      {/* Answer input display */}
      <div
        className={`flex items-center justify-center rounded-2xl py-4 text-5xl font-bold border-4 transition-all ${
          isCorrect ? 'border-green-400 bg-green-50 text-green-600' :
          isWrong   ? 'border-red-300 bg-red-50 text-red-500' :
          'border-blue-300 bg-white text-gray-800'
        }`}
        style={{ minHeight: '72px' }}
      >
        {userAnswer !== '' ? userAnswer : (
          <span className="text-gray-300 text-3xl">?</span>
        )}
      </div>

      {/* Number pad */}
      <NumberPad
        onDigit={onDigit}
        onBackspace={onBackspace}
        onSubmit={onSubmit}
        disabled={feedback !== 'none'}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Session Complete Screen
// ─────────────────────────────────────────────────────────────
function SessionCompleteScreen({
  result,
  level,
  theme,
  onContinue,
  onRetry,
  onNextLevel,
}: {
  result: SessionResult
  level: Level
  theme: Theme
  onContinue: () => void
  onRetry: () => void
  onNextLevel: () => void
}) {
  const pct = Math.round((result.correct / result.total) * 100)
  const masteryPct = Math.round(level.masteryThreshold * 100)

  return (
    <div className="flex flex-col items-center gap-5 p-6 max-w-sm mx-auto text-center">
      {result.mastered && <Confetti />}

      <div className="text-5xl mt-4">
        {result.isPerfect ? '💎' : result.mastered ? '🎉' : '💪'}
      </div>

      <div className="text-3xl font-bold text-gray-800">
        {result.isPerfect
          ? 'Perfect Score!'
          : result.mastered
          ? 'Level Mastered!'
          : 'Good Practice!'}
      </div>

      {/* Theme celebration line on mastery */}
      {result.mastered && (
        <div className="text-lg font-semibold text-purple-600">
          {theme.celebrationLine}
        </div>
      )}

      {/* Score card */}
      <div className="w-full rounded-3xl bg-white shadow-lg p-5 border-2 border-gray-100">
        <div className="text-6xl font-bold" style={{ color: level.color }}>
          {result.correct}/{result.total}
        </div>
        <div className="text-gray-500 mt-1">{pct}% correct</div>

        <div className="mt-4 bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              backgroundColor: result.mastered ? '#22C55E' : '#F97316',
            }}
          />
        </div>
        <div className="text-sm text-gray-400 mt-1">Need {masteryPct}% to master this level</div>
      </div>

      {/* Stars earned */}
      <div className="flex items-center gap-2 text-2xl font-bold text-yellow-500">
        +{result.starsEarned} ⭐ earned this session
      </div>

      {/* Adaptive "Level Up?" banner — only when mastery NOT triggered */}
      {result.adaptiveBanner && !result.mastered && (
        <div className="w-full rounded-2xl bg-blue-50 border-2 border-blue-300 p-4">
          <div className="font-bold text-blue-700">🚀 You&apos;re flying!</div>
          <div className="text-sm text-blue-600 mt-0.5">
            You were super fast and accurate. Ready to try the next level?
          </div>
          <button
            onClick={onNextLevel}
            className="mt-3 w-full py-2 bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition-transform"
          >
            Try next level →
          </button>
        </div>
      )}

      {/* New achievements */}
      {result.newAchievements.length > 0 && (
        <div className="w-full">
          <div className="text-sm font-semibold text-gray-500 mb-2">New achievements!</div>
          {result.newAchievements.map(id => {
            const a = ALL_ACHIEVEMENTS.find(x => x.id === id)
            if (!a) return null
            return (
              <div key={id} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-2 mb-2">
                <span className="text-2xl">{a.icon}</span>
                <span className="font-bold text-sm">{a.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Buttons */}
      {result.mastered ? (
        <button
          onClick={onContinue}
          className="w-full py-4 text-2xl font-bold rounded-2xl text-white bg-green-500 hover:bg-green-600 active:scale-95 transition-transform shadow-lg"
        >
          Next Level! →
        </button>
      ) : (
        <div className="flex gap-3 w-full">
          <button
            onClick={onRetry}
            className="flex-1 py-4 text-xl font-bold rounded-2xl text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-transform shadow"
          >
            Try Again
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-4 text-xl font-bold rounded-2xl text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-transform shadow"
          >
            Home
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Level Complete Screen (full celebration)
// ─────────────────────────────────────────────────────────────
function LevelCompleteScreen({
  level,
  nextLevel,
  theme,
  onContinue,
}: {
  level: Level
  nextLevel: Level | null
  theme: Theme
  onContinue: () => void
}) {
  useEffect(() => {
    playLevelCompleteSound()
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto text-center">
      <Confetti />
      <div className="text-7xl mt-6 animate-bounce">{level.icon}</div>
      <div className="text-3xl font-bold text-gray-800 animate-bounce-in">
        {level.unlockMessage}
      </div>
      <div className="text-2xl font-bold text-purple-600">
        {theme.celebrationLine}
      </div>
      <div className="text-5xl font-bold text-yellow-500 animate-pulse-scale">
        🏆 Level {level.id} Complete!
      </div>

      {nextLevel ? (
        <div
          className="w-full rounded-3xl p-5 text-white shadow-xl animate-bounce-in"
          style={{ backgroundColor: nextLevel.color }}
        >
          <div className="text-sm font-semibold opacity-80 mb-1">Up next →</div>
          <div className="text-3xl">{nextLevel.icon}</div>
          <div className="text-xl font-bold mt-1">{nextLevel.name}</div>
          <div className="text-sm opacity-90">{nextLevel.description}</div>
        </div>
      ) : (
        <div className="w-full rounded-3xl p-5 bg-yellow-400 shadow-xl">
          <div className="text-4xl">🌟</div>
          <div className="text-xl font-bold mt-1">You finished ALL levels!</div>
          <div className="text-sm">You are a true Math Master!</div>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full py-4 text-2xl font-bold rounded-2xl text-white bg-green-500 hover:bg-green-600 active:scale-95 transition-transform shadow-lg"
      >
        {nextLevel ? `Let's go! ${nextLevel.icon}` : '🏠 Home'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main MathGame component — orchestrates everything
// ─────────────────────────────────────────────────────────────
export default function MathGame() {

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
  const theme = PRESET_THEMES.find(t => t.key === activeProfile?.themeKey) ?? PRESET_THEMES[0]

  // ── Navigation ───────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('home')
  const [subScreen, setSubScreen] = useState<SubScreen>('none')
  const [editingProfile, setEditingProfile] = useState<ProfileSave | null>(null)

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
  const sessionAttemptsRef = useRef<ProblemAttempt[]>([])
  const sessionCorrectRef = useRef(0)  // mirror of sessionCorrect for closure-safe endSession

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
    problemStartTime.current = Date.now()
    setScreen('playing')
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
      advanceProblem(isRight, level)
    }, delay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, userAnswer, activeLevelId, problems, problemIndex, theme.soundStyle])

  // ── Advance to next problem or end session ────────────────
  const advanceProblem = useCallback(
    (wasCorrect: boolean, level: Level) => {
      const nextIndex = problemIndex + 1

      if (nextIndex >= level.problemsPerSession) {
        endSession(wasCorrect, level)
      } else {
        setProblemIndex(nextIndex)
        setUserAnswer('')
        setFeedback('none')
        problemStartTime.current = Date.now()  // reset timer for next problem
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
      }
      setSessionResult(result)
      setScreen('session-complete')
      if (mastered) playLevelCompleteSound()
    },
    [activeProfileId]  // D2: `profiles` removed — updater reads fresh prev instead
  )

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

  // ── Cleanup timers ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    }
  }, [])

  // ── Derived values ────────────────────────────────────────
  const activeLevel = getLevelById(activeLevelId)

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

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="relative w-full max-w-sm mx-auto min-h-screen overflow-x-hidden">
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
          onPlay={() => {
            const lvl = Math.min(activeProfile.highestUnlockedLevel, TOTAL_LEVELS)
            startSession(lvl)
          }}
          onSelectLevel={() => setScreen('level-select')}
          onViewAchievements={() => setSubScreen('achievements')}
          onSwitchProfile={id => switchProfile(id)}
          onAddProfile={() => setSubScreen('profile-create')}
          onLongPressProfile={profile => {
            setEditingProfile(profile)
            setSubScreen('profile-edit')
          }}
        />
      )}

      {screen === 'home' && subScreen === 'achievements' && (
        <AchievementsScreen activeProfile={activeProfile} onBack={() => setSubScreen('none')} />
      )}

      {/* ── Level Select ── */}
      {screen === 'level-select' && (
        <LevelSelectScreen
          activeProfile={activeProfile}
          onSelect={(id) => startSession(id)}
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
          readerMode={activeProfile.readerMode}
          showDots={sessionShowDots}
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
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
          onRetry={() => startSession(activeLevelId)}
          onNextLevel={() => {
            const nextId = activeLevelId + 1
            const nextLevel = getLevelById(nextId)
            if (nextLevel) {
              startSession(nextId)
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
            } else {
              setScreen('home')
              setSubScreen('none')
            }
          }}
        />
      )}
    </div>
  )
}
