'use client'

import React, { useEffect } from 'react'
import { Level } from '@/lib/curriculum'
import { Theme, getLocationForLevel } from '@/lib/themes'
import { playLevelCompleteSound } from '@/lib/sounds'
import { Confetti } from '@/components/shared/Confetti'

export function LevelCompleteScreen({
  level,
  nextLevel,
  theme,
  onContinue,
}: {
  level: Level
  nextLevel: Level | null
  theme: Theme
  onContinue: () => void
}) {
  const storyHook = getLocationForLevel(theme, level.id).storyHook
  const CROSSING_LEVELS = [5, 10, 15, 20]
  const isCrossing = CROSSING_LEVELS.includes(level.id)
  const newLocation = isCrossing && level.id < 20
    ? getLocationForLevel(theme, level.id + 1)
    : null

  useEffect(() => {
    playLevelCompleteSound()
  }, [])

  return (
    <div className="screen screen-enter">
      <div className="col celebrate" style={{ paddingTop: 26 }}>
        <Confetti />
        <div style={{ fontSize: 72 }} className="bounce-in">{level.icon}</div>
        <div className="h-title bounce-in">{storyHook}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--star)' }}>{theme.celebrationLine}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--star)' }} className="pulse-scale">
          🏆 Level {level.id} Complete!
        </div>

        {newLocation && (
          <div className="card bounce-in" style={{ padding: 20, width: '100%', textAlign: 'center', border: '2px solid color-mix(in srgb, var(--star) 40%, transparent)' }}>
            <div style={{ fontSize: 36 }}>{newLocation.icon}</div>
            <div className="label" style={{ color: 'var(--star)', marginTop: 4 }}>New location unlocked!</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>{newLocation.name}</div>
          </div>
        )}

        {nextLevel ? (
          <div className="level-hero bounce-in" style={{ background: nextLevel.color, width: '100%' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>Up next →</div>
            <div className="em">{nextLevel.icon}</div>
            <h3>{nextLevel.name}</h3>
            <p>{nextLevel.description}</p>
          </div>
        ) : (
          <div className="level-hero" style={{ background: 'var(--primary)', color: 'var(--on-primary)', width: '100%' }}>
            <div style={{ fontSize: 36 }}>🌟</div>
            <h3>You finished ALL levels!</h3>
            <p>You are a true Math Master!</p>
          </div>
        )}

        <button className="btn-primary" onClick={onContinue}>
          {nextLevel ? `Let's go! ${nextLevel.icon}` : '🏠 Home'}
        </button>
      </div>
    </div>
  )
}
