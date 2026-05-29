'use client'

import React from 'react'
import { ProfileSave, AdaptiveState, WeakPair } from '@/lib/storage'
import { CURRICULUM } from '@/lib/curriculum'
import { PRESET_THEMES } from '@/lib/themes'
import { availableStars } from '@/lib/world'

function aggregateWeakPairs(adaptiveState: Record<number, AdaptiveState>): WeakPair[] {
  const map = new Map<string, WeakPair>()
  for (const state of Object.values(adaptiveState)) {
    for (const p of state.weakPairs ?? []) {
      if (!p.op) continue
      const key = `${p.a}${p.op}${p.b}`
      const prev = map.get(key)
      map.set(key, { ...p, misses: (prev?.misses ?? 0) + p.misses })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.misses - a.misses).slice(0, 10)
}

export function ParentProgressScreen({
  profile,
  onBack,
}: {
  profile: ProfileSave
  onBack: () => void
}) {
  const pTheme = PRESET_THEMES.find(t => t.key === profile.themeKey) ?? PRESET_THEMES[0]
  const masteredCount = Object.values(profile.levelProgress).filter(lp => lp.completed).length
  const accuracy = profile.totalProblemsAnswered > 0
    ? Math.round((profile.totalCorrectAnswers / profile.totalProblemsAnswered) * 100)
    : null
  const balance = availableStars(profile)
  const weakPairs = aggregateWeakPairs(profile.adaptiveState)

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.07] sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 active:text-slate-200 active:scale-90 transition-all"
        >
          ⬅
        </button>
        <span className="text-2xl">{pTheme.mascot}</span>
        <div className="text-xl font-bold text-slate-100">{profile.profileName}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: '⭐', value: profile.totalStars, label: 'Stars earned' },
            { icon: '✅', value: masteredCount, label: 'Mastered' },
            { icon: '🎯', value: accuracy !== null ? `${accuracy}%` : '—', label: 'Accuracy' },
            { icon: '🔥', value: profile.streak, label: 'Day streak' },
            { icon: '📚', value: profile.totalSessionsPlayed, label: 'Sessions' },
            { icon: '💰', value: balance, label: 'Available ⭐' },
          ].map(({ icon, value, label }) => (
            <div key={label} className="bg-slate-800 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xl leading-none">{icon}</div>
              <div className="text-base font-bold text-amber-400 mt-1">{value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Level progress grid */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Level Progress
          </div>
          <div className="space-y-1.5">
            {CURRICULUM.map(level => {
              const lp = profile.levelProgress[level.id]
              const mastered = lp?.completed ?? false
              const attempted = !!lp && !mastered
              const locked = level.id > profile.highestUnlockedLevel

              const levelAccuracy =
                lp && lp.totalAttempts > 0
                  ? Math.round((lp.totalCorrect / lp.totalAttempts) * 100)
                  : null

              return (
                <div
                  key={level.id}
                  className={`flex items-center gap-3 rounded-xl p-2.5 border ${
                    mastered
                      ? 'border-white/15'
                      : locked
                      ? 'border-dashed border-white/5 opacity-40'
                      : 'border-white/10'
                  }`}
                  style={mastered ? { backgroundColor: `${level.color}22` } : { backgroundColor: 'rgb(30 41 59 / 0.5)' }}
                >
                  {/* Color bar */}
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: level.color }} />

                  {/* Icon + name */}
                  <span className="text-lg flex-shrink-0">{level.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-300 truncate">{level.name}</div>
                    {levelAccuracy !== null && (
                      <div className="text-[10px] text-slate-500">{levelAccuracy}% accuracy · {lp?.bestScore}/{level.problemsPerSession} best</div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className={`text-xs font-bold flex-shrink-0 ${
                    mastered ? 'text-amber-400' : attempted ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {mastered ? '✅' : attempted ? '🔓' : '🔒'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weak pairs */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            📌 Areas to Practice
          </div>
          {weakPairs.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">No weak spots yet!</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weakPairs.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5"
                >
                  <span className="font-mono text-sm text-slate-100">{p.a} {p.op} {p.b}</span>
                  <span className="text-xs text-red-400">{p.misses}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
