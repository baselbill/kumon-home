'use client'

import React, { useState } from 'react'
import { ProfileSave } from '@/lib/storage'
import { PRESET_THEMES, resolveTheme } from '@/lib/themes'
import { Toggle } from '@/components/shared/Toggle'

export function ProfileEditor({
  profile,
  canDelete,
  onSave,
  onDelete,
  onCancel,
}: {
  profile: ProfileSave
  canDelete: boolean
  onSave: (updates: Pick<ProfileSave, 'profileName' | 'themeKey' | 'readerMode'>) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(profile.profileName)
  const [themeKey, setThemeKey] = useState(profile.themeKey)
  const [readerMode, setReaderMode] = useState(profile.readerMode)
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    let finalThemeKey = themeKey
    if (showCustom && customText.trim()) {
      finalThemeKey = resolveTheme(customText).key
    }
    onSave({
      profileName: name.trim() || profile.profileName,
      themeKey: finalThemeKey,
      readerMode,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={onCancel}
    >
      <div
        className="bg-slate-800 rounded-t-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-xl font-bold text-slate-100 mb-4">Edit Player</div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-xl px-4 py-2 text-base focus:outline-none focus:border-amber-400"
            autoComplete="off"
          />
        </div>

        {/* Theme grid */}
        <div className="mb-2">
          <label className="block text-sm font-semibold text-slate-300 mb-2">World</label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_THEMES.map(t => (
              <button
                key={t.key}
                onClick={() => { setThemeKey(t.key); setShowCustom(false) }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  themeKey === t.key && !showCustom
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'bg-slate-700 border-slate-600'
                }`}
              >
                <span className="text-2xl">{t.mascot}</span>
                <span className="text-xs font-medium text-slate-300 leading-tight text-center">{t.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCustom(s => !s)}
            className="mt-2 text-sm text-amber-400 font-semibold"
          >
            {showCustom ? '▼' : '▶'} Custom theme
          </button>
          {showCustom && (
            <input
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder='e.g. "ninja cats" or "pirates"'
              className="w-full mt-2 bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
              autoComplete="off"
            />
          )}
        </div>

        {/* Reader mode */}
        <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 mb-4">
          <div>
            <div className="font-semibold text-slate-100">
              Can {name.trim() || 'this player'} read yet?
            </div>
            <div className="text-xs text-slate-400">Story sentences</div>
          </div>
          <Toggle on={readerMode} onChange={setReaderMode} />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3 text-lg font-bold rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-95 transition-transform shadow mb-3"
        >
          Save changes
        </button>

        {/* Delete */}
        {canDelete && (
          showDeleteConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl border-2 border-slate-600 text-slate-300 font-semibold"
              >
                Keep
              </button>
              <button
                onClick={onDelete}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold"
              >
                Delete!
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 text-red-400 font-semibold text-sm"
            >
              Delete player…
            </button>
          )
        )}
      </div>
    </div>
  )
}
