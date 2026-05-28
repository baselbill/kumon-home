'use client'

import React, { useState } from 'react'
import { PRESET_THEMES } from '@/lib/themes'
import { getLevelById, getStartingLevel } from '@/lib/curriculum'
import { Toggle } from '@/components/shared/Toggle'

export function ProfileCreator({
  onDone,
  onCancel,
}: {
  onDone: (name: string, themeKey: string, readerMode: boolean, age?: number) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState('')
  const [themeKey, setThemeKey] = useState(PRESET_THEMES[0].key)
  const [readerMode, setReaderMode] = useState(false)
  const [age, setAge] = useState<number | null>(null)

  const selectedTheme = PRESET_THEMES.find(t => t.key === themeKey) ?? PRESET_THEMES[0]
  const startLevel = age != null ? getStartingLevel(age) : null
  const startLevelName = startLevel != null ? (getLevelById(startLevel)?.name ?? 'Math Master') : null

  return (
    <div className="flex flex-col gap-5 p-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-100">Add a Player</div>
        <div className="text-sm text-slate-400 mt-1">Parents set this up</div>
      </div>

      {/* Name input */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1">Player name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Emma"
          maxLength={20}
          className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
          autoComplete="off"
        />
      </div>

      {/* Age stepper — sets the starting level */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Age{' '}
          <span className="text-slate-500 font-normal">(optional — skips too-easy levels)</span>
        </label>
        <div className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3">
          <button
            onClick={() => setAge(a => a == null ? null : Math.max(4, a - 1))}
            disabled={age == null || age <= 4}
            className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 text-xl font-bold text-slate-100 flex items-center justify-center active:scale-95 disabled:opacity-30"
          >−</button>
          <div className="flex-1 text-center">
            {age != null ? (
              <span className="text-3xl font-bold text-slate-100">{age}</span>
            ) : (
              <button
                onClick={() => setAge(6)}
                className="text-sm text-amber-400 font-semibold underline underline-offset-2"
              >
                Tap to set age
              </button>
            )}
          </div>
          <button
            onClick={() => setAge(a => Math.min(16, (a ?? 5) + 1))}
            disabled={age != null && age >= 16}
            className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 text-xl font-bold text-slate-100 flex items-center justify-center active:scale-95 disabled:opacity-30"
          >+</button>
        </div>
        <div className="mt-1.5 text-center text-xs min-h-[1.1rem]">
          {startLevelName != null ? (
            <span className="text-amber-400 font-medium">Starts at: {startLevelName}</span>
          ) : (
            <span className="text-slate-500">Starts at level 1 if age not set</span>
          )}
        </div>
      </div>

      {/* Theme picker — emoji grid, no reading required */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Choose a world</label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_THEMES.map(t => (
            <button
              key={t.key}
              onClick={() => setThemeKey(t.key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                themeKey === t.key
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'bg-slate-700 border-slate-600'
              }`}
            >
              <span className="text-2xl">{t.mascot}</span>
              <span className="text-xs font-medium text-slate-300 leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reader mode toggle */}
      <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4">
        <div>
          <div className="font-semibold text-slate-100">
            Can {name.trim() || 'this player'} read yet?
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Adds story sentences</div>
        </div>
        <Toggle on={readerMode} onChange={setReaderMode} />
      </div>

      {/* Done button */}
      <button
        onClick={() => {
          const trimmed = name.trim()
          if (trimmed) onDone(trimmed, themeKey, readerMode, age ?? undefined)
        }}
        disabled={!name.trim()}
        className="w-full py-4 text-xl font-bold rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform shadow-lg"
      >
        Let&apos;s play! {selectedTheme.mascot}
      </button>

      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-300"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
