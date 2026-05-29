'use client'

import React from 'react'

export function BottomNav({
  active,
  onHome,
  onLevels,
  onWorld,
  onAwards,
}: {
  active: 'home' | 'levels' | 'world' | 'awards'
  onHome: () => void
  onLevels: () => void
  onWorld: () => void
  onAwards: () => void
}) {
  const items: { key: 'home' | 'levels' | 'world' | 'awards'; icon: string; label: string; onClick: () => void }[] = [
    { key: 'home',   icon: '🏠', label: 'Home',   onClick: onHome },
    { key: 'levels', icon: '📚', label: 'Levels', onClick: onLevels },
    { key: 'world',  icon: '🌍', label: 'World',  onClick: onWorld },
    { key: 'awards', icon: '🏅', label: 'Awards', onClick: onAwards },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-sm bg-slate-900/95 backdrop-blur border-t border-white/[0.07] flex pointer-events-auto">
        {items.map(({ key, icon, label, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className={`flex flex-col items-center gap-0.5 flex-1 py-2.5 transition-colors active:scale-95 ${
              active === key ? 'text-amber-400' : 'text-slate-500 active:text-slate-300'
            }`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
