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
  const handleDigit = (d: number) => { if (!disabled) { playTapSound(); onDigit(d) } }
  const handleBack  = () => { if (!disabled) { playTapSound(); onBackspace() } }
  const handleOk    = () => { if (!disabled) onSubmit() }

  return (
    <div className="pad">
      {[1,2,3,4,5,6,7,8,9].map(d => (
        <button key={d} className="key" disabled={disabled} onClick={() => handleDigit(d)}>{d}</button>
      ))}
      <button className="key del" disabled={disabled} onClick={handleBack}>⌫</button>
      <button className="key" disabled={disabled} onClick={() => handleDigit(0)}>0</button>
      <button className="key ok" disabled={disabled} onClick={handleOk}>✓</button>
    </div>
  )
}
