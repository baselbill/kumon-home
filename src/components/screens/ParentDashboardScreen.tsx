'use client'

import React from 'react'
import { ProfileSave } from '@/lib/storage'
import { PRESET_THEMES } from '@/lib/themes'
import { availableStars } from '@/lib/world'

export function ParentDashboardScreen({
  profiles,
  onViewProgress,
  onViewSettings,
  onClose,
}: {
  profiles: ProfileSave[]
  onViewProgress: (profileId: string) => void
  onViewSettings: (profileId: string) => void
  onClose: () => void
}) {
  return (
    <div className="screen screen-enter">
      <div className="col" style={{ paddingBottom: 28 }}>
        <div className="row-between" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="iconbtn" onClick={onClose}>←</button>
            <div className="h-title" style={{ fontSize: 24 }}>👨‍👩‍👧 Parent Dashboard</div>
          </div>
          <div style={{ width: 44 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {profiles.map(p => {
            const pTheme = PRESET_THEMES.find(t => t.key === p.themeKey) ?? PRESET_THEMES[0]
            const masteredCount = Object.values(p.levelProgress).filter(lp => lp.completed).length
            const accuracy = p.totalProblemsAnswered > 0
              ? Math.round((p.totalCorrectAnswers / p.totalProblemsAnswered) * 100)
              : null
            const balance = availableStars(p)

            return (
              <div key={p.profileId} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 26 }}>{pTheme.mascot}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{p.profileName}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{pTheme.label} theme</div>
                  </div>
                  {p.readerMode && (
                    <div style={{ fontSize: 10, background: 'var(--surface-2)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 700 }}>
                      Reader
                    </div>
                  )}
                </div>

                <div className="parent-stat" style={{ marginBottom: 12 }}>
                  {[
                    { icon: '⭐', value: p.totalStars, label: 'Stars' },
                    { icon: '✅', value: masteredCount, label: 'Mastered' },
                    { icon: '🎯', value: accuracy !== null ? `${accuracy}%` : '—', label: 'Accuracy' },
                    { icon: '🔥', value: p.streak, label: 'Streak' },
                    { icon: '📚', value: p.totalSessionsPlayed, label: 'Sessions' },
                    { icon: '💰', value: balance, label: 'Stars left' },
                  ].map(({ icon, value, label }) => (
                    <div key={label} className="pstat">
                      <div style={{ fontSize: 16 }}>{icon}</div>
                      <div className="v">{value}</div>
                      <div className="l">{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-ghost"
                    style={{ flex: 1, textAlign: 'center', padding: '10px 12px', fontSize: 14 }}
                    onClick={() => onViewProgress(p.profileId)}
                  >
                    Progress →
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ flex: 1, textAlign: 'center', padding: '10px 12px', fontSize: 14 }}
                    onClick={() => onViewSettings(p.profileId)}
                  >
                    Settings ⚙
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
