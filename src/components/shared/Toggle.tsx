'use client'

import React from 'react'

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 ${on ? 'bg-purple-500' : 'bg-slate-600'}`}
      role="switch"
      aria-checked={on}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${on ? 'left-5' : 'left-0.5'}`}
      />
    </button>
  )
}
