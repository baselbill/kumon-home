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
}) {
  const highestLevel = getLevelById(activeProfile.highestUnlockedLevel)
  const allDone = activeProfile.highestUnlockedLevel > TOTAL_LEVELS
  const masteredCount = Object.values(activeProfile.levelProgress).filter(p => p.completed).length
  const currentLevelId = Math.min(activeProfile.highestUnlockedLevel, TOTAL_LEVELS)
  const nextLevel = !allDone ? getLevelById(currentLevelId + 1) : null
  const currentLocation = getLocationForLevel(theme, currentLevelId)

  // Long-press implementation via touch + mouse events (longpress is not a DOM event)
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
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-sm mx-auto text-center">

      {/* Profile chips */}
      <div className="flex gap-2 flex-wrap justify-center w-full">
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all text-sm font-semibold select-none ${
                isActive
                  ? 'border-amber-400/60 bg-amber-400/10 text-amber-400'
                  : 'border-white/10 bg-white/5 text-slate-400'
              }`}
            >
              <span>{pTheme.mascot}</span>
              <span>{p.profileName}</span>
            </button>
          )
        })}
        <button
          onClick={onAddProfile}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-dashed border-slate-600 text-slate-500 text-sm hover:border-slate-500"
        >
          + Add
        </button>
      </div>

      {/* Header */}
      <div className="text-4xl font-bold text-slate-100 leading-tight mt-2">
        Math Adventure!
      </div>

      {/* Themed mascot — shows evolved form */}
      <Mascot mood="idle" theme={theme} companionStage={companionStage} />

      {/* Stats row */}
      <div className="flex gap-4 justify-center w-full">
        <div className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-2xl p-3">
          <div className="text-2xl">⭐</div>
          <div className="text-2xl font-bold text-amber-400">{activeProfile.totalStars}</div>
          <div className="text-xs text-slate-500">Stars</div>
        </div>
        <div className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-2xl p-3">
          <div className="text-2xl">🔥</div>
          <div className="text-2xl font-bold text-amber-400">{activeProfile.streak}</div>
          <div className="text-xs text-slate-500">Day streak</div>
        </div>
        <div className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-2xl p-3">
          <div className="text-2xl">{allDone ? '🏆' : '✅'}</div>
          <div className="text-2xl font-bold text-amber-400">
            {allDone ? '20' : masteredCount}
          </div>
          <div className="text-xs text-slate-500">Mastered</div>
        </div>
      </div>

      {/* World thumbnail */}
      <button
        onClick={onOpenWorld}
        className="w-full rounded-2xl border border-white/[0.07] bg-slate-800/50 p-3 flex items-center gap-3 active:scale-95 transition-transform"
      >
        <div className="flex flex-col gap-[2px] flex-shrink-0">
          {Array.from({ length: GRID_SIZE }, (_, row) => (
            <div key={row} className="flex gap-[2px]">
              {Array.from({ length: GRID_SIZE }, (_, col) => {
                const placed = getItemAt(activeProfile.world ?? [], col, row)
                const catalogItem = placed ? ITEM_CATALOG.find(i => i.id === placed.itemId) : undefined
                return (
                  <div
                    key={col}
                    className="rounded-[2px] flex items-center justify-center"
                    style={{ width: 10, height: 10, backgroundColor: placed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)' }}
                  >
                    {catalogItem && (
                      <span style={{ fontSize: 7, lineHeight: 1 }}>{catalogItem.emoji}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex-1 text-left">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">My World</div>
          <div className="text-sm font-bold text-slate-300">
            {(activeProfile.world ?? []).length} / {GRID_SIZE * GRID_SIZE} items placed
          </div>
        </div>
        <div className="text-amber-400 font-bold text-sm flex items-center gap-1">
          <span>⭐</span>
          <span>{availableStars}</span>
        </div>
      </button>

      {/* Journey progress strip */}
      <div className="w-full">
        {!allDone && (
          <div className="flex items-center justify-center gap-1 mb-2 text-xs font-semibold text-slate-400">
            <span>📍</span>
            <span>{currentLocation.icon} {currentLocation.name}</span>
          </div>
        )}
        <div className="flex gap-[3px] justify-center">
          {CURRICULUM.map(level => {
            const prog = activeProfile.levelProgress[level.id]
            const mastered = prog?.completed ?? false
            const unlocked = level.id <= activeProfile.highestUnlockedLevel
            const isCurrent = level.id === currentLevelId && !allDone
            return (
              <div
                key={level.id}
                className={`rounded-full flex-shrink-0 transition-all ${
                  isCurrent ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-slate-900' : ''
                }`}
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: level.color,
                  opacity: mastered ? 1 : unlocked ? 0.45 : 0.12,
                }}
              />
            )
          })}
        </div>
        <div className="text-center text-xs text-slate-500 mt-2 font-semibold">
          {allDone
            ? '🏆 All 20 levels mastered!'
            : `Level ${currentLevelId} of ${TOTAL_LEVELS} · ${masteredCount} mastered`}
        </div>
      </div>

      {/* Current level card */}
      {!allDone && highestLevel && (
        <div
          className="w-full rounded-2xl p-4 text-white shadow-lg border border-white/10"
          style={{ backgroundColor: highestLevel.color }}
        >
          <div className="text-3xl mb-1">{highestLevel.icon}</div>
          <div className="font-bold text-lg">{highestLevel.name}</div>
          <div className="text-sm opacity-90">{highestLevel.description}</div>
        </div>
      )}

      {allDone && (
        <div className="w-full rounded-2xl p-4 bg-amber-400 text-slate-900 shadow-lg">
          <div className="text-3xl mb-1">🏆</div>
          <div className="font-bold text-lg">You finished all levels!</div>
          <div className="text-sm">{theme.celebrationLine}</div>
        </div>
      )}

      {/* Next up teaser */}
      {!allDone && nextLevel && (
        <div className="w-full rounded-2xl p-3 border border-white/[0.07] bg-slate-800/50 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: `${nextLevel.color}22`, border: `1.5px solid ${nextLevel.color}55` }}
          >
            {nextLevel.icon}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Next up</div>
            <div className="text-sm font-bold text-slate-300 leading-tight">{nextLevel.name}</div>
            <div className="text-xs text-slate-500 truncate">{nextLevel.description}</div>
          </div>
          <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: nextLevel.color }} />
        </div>
      )}

      {/* Buttons */}
      <button
        onClick={onPlay}
        className="w-full py-4 text-2xl font-bold rounded-2xl shadow-lg bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-95 transition-transform"
      >
        {allDone ? '🔄 Play Again' : '▶ Play!'}
      </button>

      <div className="text-xs text-slate-600 pb-2">
        Hold an avatar to edit • Tap to switch player
      </div>
    </div>
  )
}
