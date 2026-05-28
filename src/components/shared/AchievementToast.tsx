'use client'

import React, { useEffect } from 'react'
import { Achievement } from '@/lib/storage'

export function AchievementToast({
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
      <div className="bg-amber-400 text-slate-900 rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3 border-2 border-amber-600">
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
