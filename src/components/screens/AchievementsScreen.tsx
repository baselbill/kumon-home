'use client'

import React from 'react'
import { ProfileSave, ALL_ACHIEVEMENTS } from '@/lib/storage'
import { PRESET_THEMES } from '@/lib/themes'

export function AchievementsScreen({ activeProfile, onBack }: { activeProfile: ProfileSave; onBack: () => void }) {
  const unlockedCompanions = activeProfile.unlockedCompanions ?? [activeProfile.themeKey]

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-sm mx-auto pb-8">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-2xl p-2 rounded-xl active:scale-90 transition-transform">⬅</button>
        <div className="text-2xl font-bold text-slate-100">Achievements</div>
      </div>

      {/* Companions grid */}
      <div>
        <div className="text-base font-bold text-slate-300 mb-3">🐾 Companions</div>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_THEMES.map(t => {
            const earned = unlockedCompanions.includes(t.key)
            const stage = earned ? (activeProfile.companionStage ?? 0) : 0
            const emoji = earned ? (t.evolutionStages[stage] ?? t.mascot) : null
            return (
              <div
                key={t.key}
                className={`flex flex-col items-center gap-1 rounded-2xl p-3 border-2 transition-all ${
                  earned
                    ? 'bg-slate-700 border-amber-400/40 shadow shadow-amber-400/10'
                    : 'bg-slate-800 border-slate-700 opacity-40'
                }`}
              >
                <div className="text-2xl">{earned ? emoji : '🔒'}</div>
                <div className={`text-[10px] font-semibold text-center leading-tight ${earned ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements list */}
      <div className="text-base font-bold text-slate-300 mt-2">🏆 Badges</div>
      <div className="flex flex-col gap-3">
        {ALL_ACHIEVEMENTS.map(a => {
          const earned = activeProfile.achievements.includes(a.id)
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-2xl p-4 shadow ${
                earned ? 'bg-slate-700 border border-amber-400/30' : 'bg-slate-800 border border-slate-700 opacity-50'
              }`}
            >
              <div className="text-3xl">{earned ? a.icon : '🔒'}</div>
              <div>
                <div className={`font-bold ${earned ? 'text-slate-100' : 'text-slate-500'}`}>{a.name}</div>
                <div className={`text-sm ${earned ? 'text-slate-400' : 'text-slate-600'}`}>{a.description}</div>
              </div>
              {earned && <div className="ml-auto text-yellow-500 font-bold">✓</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
