'use client'

import React, { useEffect } from 'react'
import { Level } from '@/lib/curriculum'
import { Theme } from '@/lib/themes'
import { playLevelCompleteSound } from '@/lib/sounds'
import { Confetti } from '@/components/shared/Confetti'

export function LevelCompleteScreen({
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
      <div className="text-3xl font-bold text-slate-100 animate-bounce-in">
        {level.unlockMessage}
      </div>
      <div className="text-2xl font-bold text-amber-400">
        {theme.celebrationLine}
      </div>
      <div className="text-5xl font-bold text-amber-400 animate-pulse-scale">
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
        <div className="w-full rounded-3xl p-5 bg-amber-400 shadow-xl">
          <div className="text-4xl">🌟</div>
          <div className="text-xl font-bold text-slate-900 mt-1">You finished ALL levels!</div>
          <div className="text-sm text-slate-900">You are a true Math Master!</div>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full py-4 text-2xl font-bold rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-95 transition-transform shadow-lg"
      >
        {nextLevel ? `Let's go! ${nextLevel.icon}` : '🏠 Home'}
      </button>
    </div>
  )
}
