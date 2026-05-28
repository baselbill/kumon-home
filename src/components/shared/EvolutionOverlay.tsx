'use client'

import React from 'react'
import { Theme } from '@/lib/themes'

export function EvolutionOverlay({
  stage,
  theme,
  onDismiss,
}: {
  stage: number
  theme: Theme
  onDismiss: () => void
}) {
  const emoji = theme.evolutionStages[stage] ?? theme.mascot
  const label = theme.evolutionLabels[stage] ?? ''

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 px-6 text-center">
      <div className="text-[5.5rem] animate-bounce-in animate-pulse-scale select-none mb-4">
        {emoji}
      </div>
      <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
        Companion evolved!
      </div>
      <div className="text-4xl font-bold text-slate-100 mb-2">{label}</div>
      <div className="text-slate-400 text-lg mb-10">
        Your companion grew stronger! ✨
      </div>
      <button
        onClick={onDismiss}
        className="px-10 py-4 text-xl font-bold rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-95 transition-transform shadow-lg"
      >
        Amazing! ✨
      </button>
    </div>
  )
}
