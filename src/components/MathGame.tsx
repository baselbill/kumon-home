'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { CURRICULUM, getLevelById, Level, TOTAL_LEVELS } from '@/lib/curriculum'
import { Problem, generateSession } from '@/lib/problems'
import {
  GameSave,
  LevelProgress,
  loadGame,
  saveGame,
  updateStreak,
  checkNewAchievements,
  ALL_ACHIEVEMENTS,
  Achievement,
} from '@/lib/storage'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type Screen = 'home' | 'level-select' | 'playing' | 'session-complete' | 'level-complete'
type FeedbackState = 'none' | 'correct' | 'wrong'

interface SessionResult {
  levelId: number
  correct: number
  total: number
  mastered: boolean
  isPerfect: boolean
  starsEarned: number
  newAchievements: string[]
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

function playCorrectSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  // Cheerful ascending arpeggio: C5 → E5 → G5
  playTone(ctx, 523.25, 0,    0.25)
  playTone(ctx, 659.25, 0.12, 0.25)
  playTone(ctx, 783.99, 0.24, 0.35)
}

function playWrongSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  // Short descending bloop
  playTone(ctx, 350, 0, 0.12, 0.2)
  playTone(ctx, 280, 0.1, 0.22, 0.2)
}

function playLevelCompleteSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  // C major arpeggio + octave jump fanfare
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5]
  notes.forEach((f, i) => playTone(ctx, f, i * 0.14, 0.4, 0.22))
}

function playTapSound() {
  const ctx = createAudioCtx()
  if (!ctx) return
  playTone(ctx, 800, 0, 0.06, 0.08, 'square')
}

// ─────────────────────────────────────────────────────────────
// Dot display (visual counting helper)
// ─────────────────────────────────────────────────────────────
const DOT_COLORS = [
  '#3B82F6', '#22C55E', '#F97316', '#8B5CF6',
  '#EC4899', '#14B8A6', '#FBBF24', '#EF4444',
]

function DotGroup({ count, color, crossed = false }: { count: number; color: string; crossed?: boolean }) {
  const size = count > 10 ? 14 : count > 5 ? 16 : 20
  return (
    <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: `${size * 5 + 4 * 4}px` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full relative flex-shrink-0"
          style={{
            width: size,
            height: size,
            backgroundColor: crossed && i >= (count - (crossed ? 0 : 0)) ? '#d1d5db' : color,
            opacity: crossed ? 0.35 : 1,
          }}
        />
      ))}
    </div>
  )
}

function DotsDisplay({ problem }: { problem: Problem }) {
  if (problem.type === 'counting') {
    return (
      <div className="flex justify-center mt-4">
        <DotGroup count={problem.operand1} color={DOT_COLORS[problem.operand1 % DOT_COLORS.length]} />
      </div>
    )
  }
  if (problem.type === 'addition' && problem.operand2 !== null) {
    return (
      <div className="flex items-center gap-4 justify-center mt-4 flex-wrap">
        <DotGroup count={problem.operand1} color="#3B82F6" />
        <span className="text-3xl font-bold text-gray-500">+</span>
        <DotGroup count={problem.operand2} color="#F97316" />
      </div>
    )
  }
  if (problem.type === 'subtraction' && problem.operand2 !== null) {
    const kept = problem.operand1 - problem.operand2
    return (
      <div className="flex items-center gap-3 justify-center mt-4 flex-wrap">
        {/* Show operand1 dots, last operand2 are faded/crossed */}
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: 160 }}>
          {Array.from({ length: problem.operand1 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full flex-shrink-0"
              style={{
                width: 18,
                height: 18,
                backgroundColor: i < kept ? '#22C55E' : '#EF4444',
                opacity: i < kept ? 1 : 0.35,
              }}
            />
          ))}
        </div>
        <span className="text-3xl font-bold text-gray-500">−</span>
        <DotGroup count={problem.operand2} color="#EF4444" />
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
  const handleOk   = () => { if (!disabled) onSubmit() }

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
function ProgressDots({ total, current, correct }: { total: number; current: number; correct: number }) {
  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current
        const isCorrect = done  // simplified — we track overall correct via sessionResults
        return (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: total > 15 ? 10 : 14,
              height: total > 15 ? 10 : 14,
              backgroundColor: i < current ? '#22C55E' : i === current ? '#FBBF24' : '#D1D5DB',
            }}
          />
        )
      })}
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
// Mascot
// ─────────────────────────────────────────────────────────────
function Mascot({ mood }: { mood: 'idle' | 'happy' | 'thinking' | 'celebrate' }) {
  const face =
    mood === 'happy'     ? '🤩' :
    mood === 'thinking'  ? '🤔' :
    mood === 'celebrate' ? '🥳' :
    '🦉'

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
// Home Screen
// ─────────────────────────────────────────────────────────────
function HomeScreen({
  save,
  onPlay,
  onSelectLevel,
  onViewAchievements,
}: {
  save: GameSave
  onPlay: () => void
  onSelectLevel: () => void
  onViewAchievements: () => void
}) {
  const highestLevel = getLevelById(save.highestUnlockedLevel)
  const allDone = save.highestUnlockedLevel > TOTAL_LEVELS

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-sm mx-auto text-center">
      {/* Header */}
      <div className="text-4xl font-bold text-purple-700 leading-tight mt-4">
        Math Adventure!
      </div>

      {/* Mascot */}
      <Mascot mood="idle" />

      {/* Stats row */}
      <div className="flex gap-4 justify-center w-full">
        <div className="flex-1 bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-3">
          <div className="text-2xl">⭐</div>
          <div className="text-2xl font-bold text-yellow-600">{save.totalStars}</div>
          <div className="text-xs text-gray-500">Stars</div>
        </div>
        <div className="flex-1 bg-orange-100 border-2 border-orange-300 rounded-2xl p-3">
          <div className="text-2xl">🔥</div>
          <div className="text-2xl font-bold text-orange-500">{save.streak}</div>
          <div className="text-xs text-gray-500">Day streak</div>
        </div>
        <div className="flex-1 bg-purple-100 border-2 border-purple-300 rounded-2xl p-3">
          <div className="text-2xl">{highestLevel?.icon ?? '🏆'}</div>
          <div className="text-2xl font-bold text-purple-600">
            {allDone ? '✓' : save.highestUnlockedLevel}
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
          <div className="text-sm">You are a Math Master!</div>
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
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Level Select Screen
// ─────────────────────────────────────────────────────────────
function LevelSelectScreen({
  save,
  onSelect,
  onBack,
}: {
  save: GameSave
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
          const unlocked = level.id <= save.highestUnlockedLevel
          const prog = save.levelProgress[level.id]
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
function AchievementsScreen({ save, onBack }: { save: GameSave; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-sm mx-auto pb-8">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-2xl p-2 rounded-xl active:scale-90 transition-transform">⬅</button>
        <div className="text-2xl font-bold text-gray-700">Achievements</div>
      </div>
      <div className="flex flex-col gap-3">
        {ALL_ACHIEVEMENTS.map(a => {
          const earned = save.achievements.includes(a.id)
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
      <ProgressDots
        total={level.problemsPerSession}
        current={problemIndex}
        correct={sessionCorrect}
      />

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

        {/* Mascot */}
        <div className="flex justify-center mb-3">
          <Mascot
            mood={
              isCorrect ? 'happy' :
              isWrong   ? 'thinking' :
              'idle'
            }
          />
        </div>

        {/* Problem text */}
        {problem.type === 'counting' ? (
          <div className="text-center text-2xl font-bold text-gray-600 mb-2">
            How many dots do you see?
          </div>
        ) : (
          <div className="text-center mb-2">
            <span className="text-5xl font-bold text-gray-800">
              {problem.operand1}
            </span>
            <span className="text-4xl font-bold text-gray-500 mx-3">
              {problem.operator}
            </span>
            <span className="text-5xl font-bold text-gray-800">
              {problem.operand2}
            </span>
            <span className="text-4xl font-bold text-gray-400 mx-3">=</span>
          </div>
        )}

        {/* Visual dots (if level uses them) */}
        {level.showDots && <DotsDisplay problem={problem} />}

        {/* Feedback message */}
        {isCorrect && (
          <div className="text-center mt-3 text-green-600 font-bold text-xl animate-bounce-in">
            Amazing! 🎉
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
  onContinue,
  onRetry,
}: {
  result: SessionResult
  level: Level
  onContinue: () => void
  onRetry: () => void
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
  onContinue,
}: {
  level: Level
  nextLevel: Level | null
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
  // ── Persistent save ──────────────────────────────────────
  const [save, setSave] = useState<GameSave>(() => loadGame())

  // ── Navigation ───────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('home')
  const [subScreen, setSubScreen] = useState<'none' | 'achievements'>('none')

  // ── Session state ────────────────────────────────────────
  const [activeLevelId, setActiveLevelId] = useState<number>(1)
  const [problems, setProblems] = useState<Problem[]>([])
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

  // ── Persist save whenever it changes ─────────────────────
  useEffect(() => {
    saveGame(save)
  }, [save])

  // ── Update streak on mount ────────────────────────────────
  useEffect(() => {
    setSave(prev => updateStreak(prev))
  }, [])

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
    setProblems(generateSession(level))
    setProblemIndex(0)
    setUserAnswer('')
    setFeedback('none')
    setSessionCorrect(0)
    setSessionResult(null)
    setFloatingStars([])
    setScreen('playing')
  }, [])

  // ── Digit input ───────────────────────────────────────────
  const handleDigit = useCallback((d: number) => {
    setUserAnswer(prev => {
      // Max 2 digits (answers ≤ 99)
      if (prev.length >= 2) return prev
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

    if (isRight) {
      playCorrectSound()
      setFeedback('correct')
      setSessionCorrect(c => c + 1)
      // spawn floating star
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
  }, [feedback, userAnswer, activeLevelId, problems, problemIndex])

  // ── Advance to next problem or end session ────────────────
  const advanceProblem = useCallback(
    (wasCorrect: boolean, level: Level) => {
      const nextIndex = problemIndex + 1

      if (nextIndex >= level.problemsPerSession) {
        // Session complete — calculate results
        endSession(wasCorrect, level)
      } else {
        setProblemIndex(nextIndex)
        setUserAnswer('')
        setFeedback('none')
      }
    },
    [problemIndex, sessionCorrect]
  )

  const endSession = useCallback(
    (lastWasCorrect: boolean, level: Level) => {
      const finalCorrect = sessionCorrect + (lastWasCorrect ? 1 : 0)
      const total = level.problemsPerSession
      const mastered =
        finalCorrect / total >= level.masteryThreshold
      const isPerfect = finalCorrect === total
      const starsEarned = finalCorrect + (isPerfect ? 5 : 0)

      // Update save
      setSave(prev => {
        const existing: LevelProgress = prev.levelProgress[level.id] ?? {
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
          completedAt: existing.completed ? existing.completedAt : mastered ? new Date().toISOString() : undefined,
        }

        const newHighest = mastered
          ? Math.max(prev.highestUnlockedLevel, level.id + 1)
          : prev.highestUnlockedLevel

        const updated: GameSave = {
          ...prev,
          totalStars: prev.totalStars + starsEarned,
          totalSessionsPlayed: prev.totalSessionsPlayed + 1,
          totalProblemsAnswered: prev.totalProblemsAnswered + total,
          totalCorrectAnswers: prev.totalCorrectAnswers + finalCorrect,
          highestUnlockedLevel: newHighest,
          levelProgress: { ...prev.levelProgress, [level.id]: newProg },
        }

        // Handle "perfect" achievement separately (needs current session info)
        if (isPerfect && !prev.achievements.includes('perfect_session')) {
          updated.achievements = [...updated.achievements, 'perfect_session']
        }

        // Check other achievements
        const newAchIds = checkNewAchievements(updated)
        if (newAchIds.length > 0) {
          updated.achievements = [...updated.achievements, ...newAchIds]
        }

        // Queue achievement toasts
        const toShow = [
          ...(isPerfect && !prev.achievements.includes('perfect_session') ? ['perfect_session'] : []),
          ...newAchIds,
        ]
        if (toShow.length > 0) {
          const toasts = toShow
            .map(id => ALL_ACHIEVEMENTS.find(a => a.id === id))
            .filter((a): a is Achievement => !!a)
          setToastQueue(q => [...q, ...toasts])
        }

        const result: SessionResult = {
          levelId: level.id,
          correct: finalCorrect,
          total,
          mastered,
          isPerfect,
          starsEarned,
          newAchievements: [
            ...(isPerfect && !prev.achievements.includes('perfect_session') ? ['perfect_session'] : []),
            ...newAchIds,
          ],
        }
        setSessionResult(result)
        setScreen('session-complete')
        if (mastered) playLevelCompleteSound()

        return updated
      })
    },
    [sessionCorrect]
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

      {/* ── Home ── */}
      {screen === 'home' && subScreen === 'none' && (
        <HomeScreen
          save={save}
          onPlay={() => {
            const lvl = Math.min(save.highestUnlockedLevel, TOTAL_LEVELS)
            startSession(lvl)
          }}
          onSelectLevel={() => setScreen('level-select')}
          onViewAchievements={() => setSubScreen('achievements')}
        />
      )}

      {screen === 'home' && subScreen === 'achievements' && (
        <AchievementsScreen save={save} onBack={() => setSubScreen('none')} />
      )}

      {/* ── Level Select ── */}
      {screen === 'level-select' && (
        <LevelSelectScreen
          save={save}
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
        />
      )}

      {/* ── Level Complete ── */}
      {screen === 'level-complete' && activeLevel && (
        <LevelCompleteScreen
          level={activeLevel}
          nextLevel={getLevelById(activeLevelId + 1) ?? null}
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
