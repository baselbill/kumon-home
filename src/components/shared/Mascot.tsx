'use client'

import React from 'react'
import { Theme } from '@/lib/themes'

export function Mascot({ mood, theme }: { mood: 'idle' | 'happy' | 'thinking' | 'celebrate'; theme: Theme }) {
  // idle → theme mascot; emotional states use expressive emoji
  const face =
    mood === 'happy'     ? '🤩' :
    mood === 'thinking'  ? '🤔' :
    mood === 'celebrate' ? '🥳' :
    theme.mascot

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
