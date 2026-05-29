'use client'

import React from 'react'
import { ProfileSave, ALL_ACHIEVEMENTS } from '@/lib/storage'
import { PRESET_THEMES } from '@/lib/themes'

export function AchievementsScreen({ activeProfile, onBack }: { activeProfile: ProfileSave; onBack: () => void }) {
  const unlockedCompanions = activeProfile.unlockedCompanions ?? [activeProfile.themeKey]

  return (
    <div className="screen screen-enter">
      <div className="col" style={{ paddingBottom: 30 }}>
        <div className="row-between" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="iconbtn" onClick={onBack}>←</button>
            <div className="h-title" style={{ fontSize: 24 }}>Achievements</div>
          </div>
          <div style={{ width: 44 }} />
        </div>

        {/* Companions */}
        <div className="label" style={{ marginBottom: 10 }}>🐾 Companions</div>
        <div className="comp-grid" style={{ marginBottom: 24 }}>
          {PRESET_THEMES.map(t => {
            const earned = unlockedCompanions.includes(t.key)
            const stage = earned ? (activeProfile.companionStage ?? 0) : 0
            const emoji = earned ? (t.evolutionStages[stage] ?? t.mascot) : null
            return (
              <div key={t.key} className={`comp${earned ? ' owned' : ' locked'}`}>
                <div className="em">{earned ? emoji : '🔒'}</div>
                <div className="l">{t.label}</div>
              </div>
            )
          })}
        </div>

        {/* Evolution track for active companion */}
        <div className="label" style={{ marginBottom: 10 }}>🌟 Evolution</div>
        <div className="evo-track" style={{ marginBottom: 24 }}>
          {PRESET_THEMES.find(t => t.key === activeProfile.themeKey)?.evolutionStages.map((stage, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="evo-arrow">→</div>}
              <div className={`evo-stage${i === (activeProfile.companionStage ?? 0) ? ' cur' : i > (activeProfile.companionStage ?? 0) ? ' future' : ''}`}>
                <div className="em">{stage}</div>
                <div className="l">Stage {i + 1}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Badges */}
        <div className="label" style={{ marginBottom: 10 }}>🏆 Badges</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALL_ACHIEVEMENTS.map(a => {
            const earned = activeProfile.achievements.includes(a.id)
            return (
              <div key={a.id} className={`badge-row${earned ? '' : ' locked'}`}>
                <div className="em">{earned ? a.icon : '🔒'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.description}</div>
                </div>
                {earned && <div style={{ color: 'var(--star)', fontWeight: 900 }}>✓</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
