'use client'

import React, { useRef } from 'react'
import { CURRICULUM, getLevelById, TOTAL_LEVELS } from '@/lib/curriculum'
import { ProfileSave } from '@/lib/storage'
import { Theme, PRESET_THEMES, getLocationForLevel } from '@/lib/themes'
import { ITEM_CATALOG } from '@/lib/catalog'
import { getItemAt, GRID_SIZE } from '@/lib/world'
import { Mascot } from '@/components/shared/Mascot'

export function HomeScreen({
  profiles,
  activeProfile,
  theme,
  companionStage,
  availableStars,
  onPlay,
  onSwitchProfile,
  onAddProfile,
  onLongPressProfile,
  onOpenWorld,
  onOpenParent,
}: {
  profiles: ProfileSave[]
  activeProfile: ProfileSave
  theme: Theme
  companionStage: number
  availableStars: number
  onPlay: () => void
  onSwitchProfile: (id: string) => void
  onAddProfile: () => void
  onLongPressProfile: (profile: ProfileSave) => void
  onOpenWorld: () => void
  onOpenParent: () => void
}) {
  const highestLevel = getLevelById(activeProfile.highestUnlockedLevel)
  const allDone = activeProfile.highestUnlockedLevel > TOTAL_LEVELS
  const masteredCount = Object.values(activeProfile.levelProgress).filter(p => p.completed).length
  const currentLevelId = Math.min(activeProfile.highestUnlockedLevel, TOTAL_LEVELS)
  const nextLevel = !allDone ? getLevelById(currentLevelId + 1) : null
  const currentLocation = getLocationForLevel(theme, currentLevelId)

  const longPressTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const startLongPress = (profile: ProfileSave) => {
    longPressTimers.current[profile.profileId] = setTimeout(() => {
      onLongPressProfile(profile)
    }, 500)
  }

  const cancelLongPress = (profileId: string) => {
    if (longPressTimers.current[profileId]) {
      clearTimeout(longPressTimers.current[profileId])
      delete longPressTimers.current[profileId]
    }
  }

  return (
    <div className="screen screen-enter">
      <div className="col col-wide" style={{ padding: '18px 20px 28px' }}>

        {/* Top bar: profile chips + gear */}
        <div className="row-between" style={{ marginBottom: 18 }}>
          <div className="profile-chips">
            {profiles.map(p => {
              const pTheme = PRESET_THEMES.find(t => t.key === p.themeKey) ?? PRESET_THEMES[0]
              const isActive = p.profileId === activeProfile.profileId
              return (
                <button
                  key={p.profileId}
                  onClick={() => onSwitchProfile(p.profileId)}
                  onTouchStart={() => startLongPress(p)}
                  onTouchEnd={() => cancelLongPress(p.profileId)}
                  onTouchCancel={() => cancelLongPress(p.profileId)}
                  onMouseDown={() => startLongPress(p)}
                  onMouseUp={() => cancelLongPress(p.profileId)}
                  onMouseLeave={() => cancelLongPress(p.profileId)}
                  className={`chip${isActive ? ' active' : ''}`}
                >
                  <span className="em">{pTheme.mascot}</span>
                  <span>{p.profileName}</span>
                </button>
              )
            })}
            <button onClick={onAddProfile} className="chip add">+ Add</button>
          </div>
          <button className="iconbtn" title="Parent area" onClick={onOpenParent}>⚙️</button>
        </div>

        {/* 2-col on desktop, single col on mobile */}
        <div className="home-grid">
          {/* Left column */}
          <div className="home-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
            <div className="h-title" style={{ whiteSpace: 'nowrap' }}>
              Hi, {activeProfile.profileName}!
            </div>

            <div className="mascot-halo">
              <Mascot mood="idle" theme={theme} companionStage={companionStage} />
            </div>

            <div className="stat-row" style={{ width: '100%' }}>
              <div className="stat slide-up stg-1">
                <div className="em">⭐</div>
                <div className="v accent">{activeProfile.totalStars}</div>
                <div className="l">Stars</div>
              </div>
              <div className="stat slide-up stg-2">
                <div className="em">🔥</div>
                <div className="v accent">{activeProfile.streak}</div>
                <div className="l">Day streak</div>
              </div>
              <div className="stat slide-up stg-3">
                <div className="em">{allDone ? '🏆' : '✅'}</div>
                <div className="v accent">{allDone ? 20 : masteredCount}</div>
                <div className="l">Mastered</div>
              </div>
            </div>

            {!allDone && highestLevel ? (
              <div className="level-hero slide-up stg-2" style={{ background: highestLevel.color, width: '100%' }}>
                <div className="em">{highestLevel.icon}</div>
                <h3>{highestLevel.name}</h3>
                <p>{highestLevel.description}</p>
              </div>
            ) : (
              <div className="level-hero" style={{ background: 'var(--primary)', color: 'var(--on-primary)', width: '100%' }}>
                <div className="em">🏆</div>
                <h3>You finished all levels!</h3>
                <p>{theme.celebrationLine}</p>
              </div>
            )}

            <button className="btn-primary" onClick={onPlay} style={{ marginTop: 4 }}>
              {allDone ? '🔄 Play Again' : '▶  Play!'}
            </button>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
            <button className="world-thumb slide-up stg-4" onClick={onOpenWorld}>
              <div className="mini-grid">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
                  const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE)
                  const placed = getItemAt(activeProfile.world ?? [], x, y)
                  const catalogItem = placed ? ITEM_CATALOG.find(ci => ci.id === placed.itemId) : undefined
                  return (
                    <div
                      key={i}
                      className="mini-cell"
                      style={{ background: placed ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.05)' }}
                    >
                      {catalogItem && <span style={{ fontSize: 8, lineHeight: 1 }}>{catalogItem.emoji}</span>}
                    </div>
                  )
                })}
              </div>
              <div style={{ flex: 1 }}>
                <div className="label">My World</div>
                <div style={{ fontWeight: 800, color: 'var(--fg-dim)', marginTop: 2 }}>
                  {(activeProfile.world ?? []).length} / {GRID_SIZE * GRID_SIZE} placed
                </div>
              </div>
              <div className="sess-stars">⭐ {availableStars}</div>
            </button>

            <div className="slide-up stg-5">
              {!allDone && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10, fontSize: 13, fontWeight: 800, color: 'var(--fg-dim)' }}>
                  📍 {currentLocation.icon} {currentLocation.name}
                </div>
              )}
              <div className="journey-strip">
                {CURRICULUM.map(level => {
                  const prog = activeProfile.levelProgress[level.id]
                  const mastered = prog?.completed ?? false
                  const unlocked = level.id <= activeProfile.highestUnlockedLevel
                  const isCurrent = level.id === currentLevelId && !allDone
                  return (
                    <div
                      key={level.id}
                      className={`j-dot${isCurrent ? ' cur' : ''}`}
                      style={{ background: level.color, opacity: mastered ? 1 : unlocked ? 0.5 : 0.16 }}
                    />
                  )
                })}
              </div>
              <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', marginTop: 10, fontWeight: 700 }}>
                {allDone
                  ? '🏆 All 20 levels mastered!'
                  : `Level ${currentLevelId} of ${TOTAL_LEVELS} · ${masteredCount} mastered`}
              </div>
            </div>

            {!allDone && nextLevel && (
              <div className="teaser slide-up stg-6">
                <div
                  className="icon"
                  style={{ background: `${nextLevel.color}22`, border: `1.5px solid ${nextLevel.color}66` }}
                >
                  {nextLevel.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="label">Next up</div>
                  <div style={{ fontWeight: 800, color: 'var(--fg-dim)' }}>{nextLevel.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nextLevel.description}
                  </div>
                </div>
                <div style={{ width: 6, height: 34, borderRadius: 999, background: nextLevel.color }} />
              </div>
            )}

            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
              Tap a player to switch • ⚙️ for grown-ups
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
