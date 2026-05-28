'use client'

import React from 'react'
import { CURRICULUM } from '@/lib/curriculum'
import { ProfileSave } from '@/lib/storage'

export function LevelSelectScreen({
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
        <div className="text-2xl font-bold text-slate-100">Choose a Level</div>
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
                unlocked ? 'active:scale-95 cursor-pointer border border-white/[0.07]' : 'opacity-40 cursor-not-allowed'
              }`}
              style={{
                backgroundColor: unlocked ? level.color : '#1E293B',
                color: unlocked ? 'white' : '#475569',
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
