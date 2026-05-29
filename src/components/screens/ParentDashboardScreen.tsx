'use client'

import React from 'react'
import { ProfileSave } from '@/lib/storage'
import { PRESET_THEMES } from '@/lib/themes'
import { availableStars } from '@/lib/world'

export function ParentDashboardScreen({
  profiles,
  onViewProgress,
  onViewSettings,
  onClose,
}: {
  profiles: ProfileSave[]
  onViewProgress: (profileId: string) => void
  onViewSettings: (profileId: string) => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.07] sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 active:text-slate-200 active:scale-90 transition-all"
        >
          ⬅
        </button>
        <div className="text-xl font-bold text-slate-100">👨‍👩‍👧 Parent Dashboard</div>
        <div className="w-9" />
      </div>

      {/* Child cards */}
      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        {profiles.map(p => {
          const pTheme = PRESET_THEMES.find(t => t.key === p.themeKey) ?? PRESET_THEMES[0]
          const masteredCount = Object.values(p.levelProgress).filter(lp => lp.completed).length
          const accuracy = p.totalProblemsAnswered > 0
            ? Math.round((p.totalCorrectAnswers / p.totalProblemsAnswered) * 100)
            : null
          const balance = availableStars(p)

          return (
            <div
              key={p.profileId}
              className="bg-slate-800 border border-white/10 rounded-2xl p-4"
            >
              {/* Name row */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{pTheme.mascot}</span>
                <div>
                  <div className="font-bold text-slate-100 text-base">{p.profileName}</div>
                  <div className="text-xs text-slate-500">{pTheme.label} theme</div>
                </div>
                {p.readerMode && (
                  <span className="ml-auto text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Reader</span>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { icon: '⭐', value: p.totalStars, label: 'Stars' },
                  { icon: '✅', value: masteredCount, label: 'Mastered' },
                  { icon: '🎯', value: accuracy !== null ? `${accuracy}%` : '—', label: 'Accuracy' },
                  { icon: '🔥', value: p.streak, label: 'Streak' },
                  { icon: '📚', value: p.totalSessionsPlayed, label: 'Sessions' },
                  { icon: '💰', value: balance, label: 'Available ⭐' },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="bg-slate-700/50 rounded-xl p-2 text-center">
                    <div className="text-lg leading-none">{icon}</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{value}</div>
                    <div className="text-[9px] text-slate-500 leading-tight">{label}</div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onViewProgress(p.profileId)}
                  className="flex-1 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 text-sm font-bold active:scale-95 transition-transform"
                >
                  Progress →
                </button>
                <button
                  onClick={() => onViewSettings(p.profileId)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 border border-white/10 text-slate-300 text-sm font-bold active:scale-95 transition-transform"
                >
                  Settings ⚙
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
