'use client'

import React from 'react'
import { Level } from '@/lib/curriculum'
import { ALL_ACHIEVEMENTS } from '@/lib/storage'
import { Theme } from '@/lib/themes'
import { formatDuration, formatAvgTime, speedTier } from '@/lib/timing'
import { SessionResult } from '@/types/game'
import { Confetti } from '@/components/shared/Confetti'

export function SessionCompleteScreen({
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

      <div className="text-3xl font-bold text-slate-100">
        {result.isPerfect
          ? 'Perfect Score!'
          : result.mastered
          ? 'Level Mastered!'
          : 'Good Practice!'}
      </div>

      {/* Theme celebration line on mastery */}
      {result.mastered && (
        <div className="text-lg font-semibold text-amber-400">
          {theme.celebrationLine}
        </div>
      )}

      {/* Score card */}
      <div className="w-full rounded-3xl bg-slate-800 shadow-lg p-5 border-2 border-white/10">
        <div className="text-6xl font-bold" style={{ color: level.color }}>
          {result.correct}/{result.total}
        </div>
        <div className="text-slate-400 mt-1">{pct}% correct</div>

        <div className="mt-4 bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              backgroundColor: result.mastered ? '#22C55E' : '#F97316',
            }}
          />
        </div>
        <div className="text-sm text-slate-500 mt-1">Need {masteryPct}% to master this level</div>
      </div>

      {/* Timing stats */}
      {result.durationMs > 0 && (
        <div className="w-full rounded-3xl bg-slate-800 shadow-lg p-5 border-2 border-white/10">
          {(() => {
            const speed = speedTier(result.avgResponseMs)
            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Speed</div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: speed.color }}
                  >
                    <span>{speed.icon}</span>
                    <span>{speed.label}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-slate-700/50 rounded-2xl p-3">
                    <div className="text-2xl font-bold text-slate-100">{formatDuration(result.durationMs)}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Total time</div>
                  </div>
                  <div className="text-center bg-slate-700/50 rounded-2xl p-3">
                    <div className="text-2xl font-bold text-slate-100">{formatAvgTime(result.avgResponseMs)}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Avg per problem</div>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Stars earned */}
      <div className="flex items-center gap-2 text-2xl font-bold text-amber-400">
        +{result.starsEarned} ⭐ earned this session
      </div>

      {/* Adaptive "Level Up?" banner — only when mastery NOT triggered */}
      {result.adaptiveBanner && !result.mastered && (
        <div className="w-full rounded-2xl bg-slate-800 border-2 border-amber-400/40 p-4">
          <div className="font-bold text-amber-400">🚀 You&apos;re flying!</div>
          <div className="text-sm text-slate-400 mt-0.5">
            You were super fast and accurate. Ready to try the next level?
          </div>
          <button
            onClick={onNextLevel}
            className="mt-3 w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl active:scale-95 transition-transform"
          >
            Try next level →
          </button>
        </div>
      )}

      {/* New achievements */}
      {result.newAchievements.length > 0 && (
        <div className="w-full">
          <div className="text-sm font-semibold text-slate-500 mb-2">New achievements!</div>
          {result.newAchievements.map(id => {
            const a = ALL_ACHIEVEMENTS.find(x => x.id === id)
            if (!a) return null
            return (
              <div key={id} className="flex items-center gap-2 bg-slate-700 border border-amber-400/30 rounded-xl p-2 mb-2">
                <span className="text-2xl">{a.icon}</span>
                <span className="font-bold text-sm text-slate-100">{a.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Buttons */}
      {result.mastered ? (
        <button
          onClick={onContinue}
          className="w-full py-4 text-2xl font-bold rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-95 transition-transform shadow-lg"
        >
          Next Level! →
        </button>
      ) : (
        <div className="flex gap-3 w-full">
          <button
            onClick={onRetry}
            className="flex-1 py-4 text-xl font-bold rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-100 active:scale-95 transition-transform shadow"
          >
            Try Again
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-4 text-xl font-bold rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-100 active:scale-95 transition-transform shadow"
          >
            Home
          </button>
        </div>
      )}
    </div>
  )
}
