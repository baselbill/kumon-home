'use client'

import React, { useState } from 'react'
import { ProfileSave } from '@/lib/storage'
import { PRESET_THEMES } from '@/lib/themes'
import { getParentPin, clearParentPin } from '@/lib/parentPin'
import { Toggle } from '@/components/shared/Toggle'

function ProfileSettingsCard({
  profile,
  onSave,
  onResetProgress,
}: {
  profile: ProfileSave
  onSave: (updates: Pick<ProfileSave, 'readerMode' | 'themeKey'>) => void
  onResetProgress: () => void
}) {
  const pTheme = PRESET_THEMES.find(t => t.key === profile.themeKey) ?? PRESET_THEMES[0]
  const [readerMode, setReaderMode] = useState(profile.readerMode)
  const [themeKey, setThemeKey] = useState(profile.themeKey)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleReaderToggle = (val: boolean) => {
    setReaderMode(val)
    onSave({ readerMode: val, themeKey })
  }

  const handleThemeSelect = (key: string) => {
    setThemeKey(key)
    onSave({ readerMode, themeKey: key })
  }

  return (
    <div className="bg-slate-800 border border-white/10 rounded-2xl p-4 space-y-4">
      {/* Child name header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{pTheme.mascot}</span>
        <span className="font-bold text-slate-100 text-base">{profile.profileName}</span>
      </div>

      {/* Reader mode */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-200">Reader Mode</div>
          <div className="text-xs text-slate-500">Story sentences around problems</div>
        </div>
        <Toggle on={readerMode} onChange={handleReaderToggle} />
      </div>

      {/* Theme picker */}
      <div>
        <div className="text-sm font-semibold text-slate-200 mb-2">World Theme</div>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_THEMES.map(t => (
            <button
              key={t.key}
              onClick={() => handleThemeSelect(t.key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all active:scale-95 ${
                themeKey === t.key
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'bg-slate-700 border-slate-600'
              }`}
            >
              <span className="text-xl">{t.mascot}</span>
              <span className="text-[9px] font-medium text-slate-300 leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reset progress */}
      <div>
        {showResetConfirm ? (
          <div className="space-y-2">
            <div className="text-sm text-red-400 font-semibold">
              Reset {profile.profileName}&apos;s progress? This cannot be undone.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold active:scale-95"
              >
                Keep
              </button>
              <button
                onClick={() => { onResetProgress(); setShowResetConfirm(false) }}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold active:scale-95"
              >
                Reset!
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-sm text-red-400 font-semibold py-1"
          >
            Reset {profile.profileName}&apos;s progress…
          </button>
        )}
      </div>
    </div>
  )
}

export function ParentSettingsScreen({
  profiles,
  onUpdateProfile,
  onBack,
  onChangePIN,
}: {
  profiles: ProfileSave[]
  onUpdateProfile: (id: string, updater: (prev: ProfileSave) => ProfileSave) => void
  onBack: () => void
  onChangePIN: () => void
}) {
  const hasPin = getParentPin() !== null
  const [showRemovePinConfirm, setShowRemovePinConfirm] = useState(false)

  const handleRemovePin = () => {
    clearParentPin()
    setShowRemovePinConfirm(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.07] sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 active:text-slate-200 active:scale-90 transition-all"
        >
          ⬅
        </button>
        <div className="text-xl font-bold text-slate-100">⚙️ Parent Settings</div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        {/* Per-child settings */}
        {profiles.map(profile => (
          <ProfileSettingsCard
            key={profile.profileId}
            profile={profile}
            onSave={updates => onUpdateProfile(profile.profileId, prev => ({ ...prev, ...updates }))}
            onResetProgress={() => onUpdateProfile(profile.profileId, prev => ({
              ...prev,
              highestUnlockedLevel: 1,
              totalStars: 0,
              streak: 0,
              lastPlayDate: null,
              levelProgress: {},
              achievements: [],
              totalSessionsPlayed: 0,
              totalProblemsAnswered: 0,
              totalCorrectAnswers: 0,
              adaptiveState: {},
              companionStage: 0,
              spentStars: 0,
              world: [],
              unlockedCompanions: [prev.themeKey],
            }))}
          />
        ))}

        {/* PIN management */}
        <div className="bg-slate-800 border border-white/10 rounded-2xl p-4">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
            Parent PIN
          </div>

          {hasPin ? (
            <div className="space-y-2">
              <button
                onClick={onChangePIN}
                className="w-full py-2.5 rounded-xl bg-slate-700 border border-white/10 text-slate-200 text-sm font-semibold active:scale-95 transition-transform"
              >
                Change PIN
              </button>
              {showRemovePinConfirm ? (
                <div className="space-y-2 pt-1">
                  <div className="text-sm text-red-400 font-semibold">Remove PIN? Anyone can access parent area.</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRemovePinConfirm(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold active:scale-95"
                    >
                      Keep
                    </button>
                    <button
                      onClick={handleRemovePin}
                      className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold active:scale-95"
                    >
                      Remove!
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRemovePinConfirm(true)}
                  className="w-full text-sm text-red-400 font-semibold py-1"
                >
                  Remove PIN…
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onChangePIN}
              className="w-full py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 text-sm font-bold active:scale-95 transition-transform"
            >
              Set a PIN
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
