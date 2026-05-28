'use client'

import React from 'react'
import { Theme } from '@/lib/themes'

export function Mascot({
  mood,
  theme,
  companionStage = 0,
}: {
  mood: 'idle' | 'happy' | 'thinking' | 'celebrate'
  theme: Theme
  companionStage?: number
}) {
  const face =
    mood === 'happy'     ? '🤩' :
    mood === 'thinking'  ? '🤔' :
    mood === 'celebrate' ? '🥳' :
    theme.evolutionStages[companionStage] ?? theme.mascot

  return (
    <div
      className={`text-6xl select-none transition-transform duration-300 ${
        mood === 'happy' || mood === 'celebrate' ? 'animate-bounce' : ''
      }`}
    >
      {face}
    </div>
  )
}
