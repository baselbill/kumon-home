'use client'

import React from 'react'
import { CURRICULUM } from '@/lib/curriculum'
import { ProfileSave } from '@/lib/storage'
import { Theme } from '@/lib/themes'

export function LevelSelectScreen({
  activeProfile,
  theme,
  onSelect,
  onBack,
}: {
  activeProfile: ProfileSave
  theme: Theme
  onSelect: (levelId: number) => void
  onBack: () => void
}) {
  return (
    <div className="screen screen-enter">
      <div className="col col-wide" style={{ paddingBottom: 30 }}>
        <div className="row-between" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="iconbtn" onClick={onBack}>←</button>
            <div className="h-title" style={{ fontSize: 24 }}>Your Journey</div>
          </div>
          <div style={{ width: 44 }} />
        </div>

        {theme.locations.map((loc, ti) => {
          const levels = CURRICULUM.filter(
            l => l.id >= loc.levelRange[0] && l.id <= loc.levelRange[1]
          )
          return (
            <div key={ti} className="j-tier">
              <div className="j-tier-head">
                <div className="ic">{loc.icon}</div>
                <div>
                  <div className="nm">{loc.name}</div>
                  <div className="rg">Levels {loc.levelRange[0]}–{loc.levelRange[1]}</div>
                </div>
              </div>
              <div className="lvl-grid">
                {levels.map((level, i) => {
                  const unlocked = level.id <= activeProfile.highestUnlockedLevel
                  const prog = activeProfile.levelProgress[level.id]
                  const done = prog?.completed ?? false
                  return (
                    <button
                      key={level.id}
                      className={`lvl-card slide-up stg-${(i % 6) + 1}${unlocked ? '' : ' locked'}`}
                      style={unlocked ? { background: level.color } : {}}
                      disabled={!unlocked}
                      onClick={() => unlocked && onSelect(level.id)}
                    >
                      {done && <div className="mastered">✅</div>}
                      <div className="n">Level {level.id}</div>
                      <div className="em">{unlocked ? level.icon : '🔒'}</div>
                      <div className="nm">{level.name}</div>
                      {unlocked && prog && !done && (
                        <div className="meta">Best {prog.bestScore}/{level.problemsPerSession}</div>
                      )}
                      {done && <div className="meta">Mastered!</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
