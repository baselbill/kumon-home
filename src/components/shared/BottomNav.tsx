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
    { key: 'levels', icon: '🗺️', label: 'Levels', onClick: onLevels },
    { key: 'world',  icon: '🌍', label: 'World',  onClick: onWorld },
    { key: 'awards', icon: '🏅', label: 'Awards', onClick: onAwards },
  ]
  return (
    <div className="tabnav">
      {items.map(({ key, icon, label, onClick }) => (
        <button
          key={key}
          onClick={onClick}
          className={`tab${active === key ? ' active' : ''}`}
        >
          <span className="ic">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
