'use client'

import React from 'react'
import { Level } from '@/lib/curriculum'
import { ALL_ACHIEVEMENTS } from '@/lib/storage'
import { Theme } from '@/lib/themes'
import { formatDuration, formatAvgTime, speedTier } from '@/lib/timing'
import { SessionResult } from '@/types/game'
import { Confetti } from '@/components/shared/Confetti'

function ScoreRing({ correct, total, color }: { correct: number; total: number; color: string }) {
  const pct = total > 0 ? correct / total : 0
  const r = 76, cx = 90, cy = 90
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const gap = circ - dash
  return (
    <div className="score-ring bounce-in">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="pct">
        <span className="frac" style={{ color }}>{correct}/{total}</span>
        <span className="lbl">{Math.round(pct * 100)}% correct</span>
      </div>
    </div>
  )
}

export function SessionCompleteScreen({
  result,
  level,
  theme,
  onContinue,
  onRetry,
  onNextLevel,
}: {
  result: SessionResult
  level: Level
  theme: Theme
  onContinue: () => void
  onRetry: () => void
  onNextLevel: () => void
}) {
  const speed = result.durationMs > 0 ? speedTier(result.avgResponseMs) : null

  return (
    <div className="screen screen-enter">
      <div className="col celebrate" style={{ paddingTop: 26 }}>
        {result.mastered && <Confetti />}

        <div style={{ fontSize: 58 }} className="bounce-in">
          {result.isPerfect ? '💎' : result.mastered ? '🎉' : '💪'}
        </div>

        <div className="h-title">
          {result.isPerfect ? 'Perfect Score!' : result.mastered ? 'Level Mastered!' : 'Good Practice!'}
        </div>

        {result.mastered && (
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--star)' }}>
            {theme.celebrationLine}
          </div>
        )}

        <ScoreRing correct={result.correct} total={result.total} color={level.color} />

        {/* Stats pair */}
        {speed && (
          <div className="statpair">
            <div className="b">
              <div className="v">{formatDuration(result.durationMs)}</div>
              <div className="l">Total time</div>
            </div>
            <div className="b">
              <div className="v" style={{ color: speed.color }}>{speed.icon} {speed.label}</div>
              <div className="l">Speed</div>
            </div>
          </div>
        )}

        {/* Stars earned */}
        <div className="sess-stars" style={{ fontSize: 20 }}>+{result.starsEarned} ⭐ earned</div>

        {/* Adaptive banner */}
        {result.adaptiveBanner && !result.mastered && (
          <div className="card" style={{ padding: 16, width: '100%', textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: 'var(--star)' }}>🚀 You&apos;re flying!</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              Super fast and accurate. Ready to try the next level?
            </div>
            <button className="btn-ghost" style={{ marginTop: 12, width: '100%' }} onClick={onNextLevel}>
              Try next level →
            </button>
          </div>
        )}

        {/* New achievements */}
        {result.newAchievements.length > 0 && (
          <div style={{ width: '100%' }}>
            <div className="label" style={{ marginBottom: 8 }}>New achievements!</div>
            {result.newAchievements.map(id => {
              const a = ALL_ACHIEVEMENTS.find(x => x.id === id)
              if (!a) return null
              return (
                <div key={id} className="ach-row" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{a.name}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Buttons */}
        {result.mastered ? (
          <button className="btn-primary" onClick={onContinue}>Next Level! →</button>
        ) : (
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <button className="btn-ghost" style={{ flex: 1, textAlign: 'center' }} onClick={onRetry}>Try Again</button>
            <button className="btn-ghost" style={{ flex: 1, textAlign: 'center' }} onClick={onContinue}>Home</button>
          </div>
        )}
      </div>
    </div>
  )
}
