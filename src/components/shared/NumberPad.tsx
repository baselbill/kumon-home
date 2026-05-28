'use client'

import React from 'react'
import { playTapSound } from '@/lib/sounds'

export function NumberPad({
  onDigit,
  onBackspace,
  onSubmit,
  disabled,
}: {
  onDigit: (d: number) => void
  onBackspace: () => void
  onSubmit: () => void
  disabled: boolean
}) {
  const btn =
    'numpad-btn flex items-center justify-center rounded-2xl font-bold text-white shadow-md active:shadow-inner transition-transform select-none cursor-pointer'

  const handleDigit = (d: number) => {
    if (!disabled) { playTapSound(); onDigit(d) }
  }
  const handleBack = () => { if (!disabled) { playTapSound(); onBackspace() } }
  const handleOk = () => { if (!disabled) onSubmit() }

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {[1,2,3,4,5,6,7,8,9].map(d => (
        <button
          key={d}
          onClick={() => handleDigit(d)}
          disabled={disabled}
          className={`${btn} bg-slate-700 hover:bg-slate-600 text-slate-100 border border-white/10 text-4xl h-16`}
          style={{ fontSize: '1.8rem' }}
        >
          {d}
        </button>
      ))}
      <button
        onClick={handleBack}
        disabled={disabled}
        className={`${btn} bg-slate-700 hover:bg-slate-600 text-slate-400 border border-white/10 h-16 text-2xl`}
      >
        ⌫
      </button>
      <button
        onClick={() => handleDigit(0)}
        disabled={disabled}
        className={`${btn} bg-slate-700 hover:bg-slate-600 text-slate-100 border border-white/10 h-16`}
        style={{ fontSize: '1.8rem' }}
      >
        0
      </button>
      <button
        onClick={handleOk}
        disabled={disabled}
        className={`${btn} bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 h-16 text-2xl`}
      >
        ✓
      </button>
    </div>
  )
}
