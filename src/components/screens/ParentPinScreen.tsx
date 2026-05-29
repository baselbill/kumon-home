'use client'

import React, { useState, useEffect } from 'react'
import { getParentPin, setParentPin, verifyPin } from '@/lib/parentPin'

type PinFlowState =
  | { step: 'enter'; digits: string }
  | { step: 'confirm'; firstEntry: string; digits: string }
  | { step: 'error'; message: string }

export function ParentPinScreen({
  mode,
  onSuccess,
  onCancel,
}: {
  mode: 'verify' | 'set'
  onSuccess: () => void
  onCancel: () => void
}) {
  const [flow, setFlow] = useState<PinFlowState>({ step: 'enter', digits: '' })
  const [shake, setShake] = useState(false)

  const digits = flow.step === 'error' ? '' : flow.digits

  useEffect(() => {
    if (flow.step === 'error') {
      const t = setTimeout(() => setFlow({ step: 'enter', digits: '' }), 1500)
      return () => clearTimeout(t)
    }
  }, [flow.step])

  const handleDigit = (d: string) => {
    if (flow.step === 'error') return
    if (flow.digits.length >= 4) return
    const next = flow.digits + d
    if (flow.step === 'enter') setFlow({ step: 'enter', digits: next })
    else if (flow.step === 'confirm') setFlow({ step: 'confirm', firstEntry: flow.firstEntry, digits: next })
    if (next.length === 4) setTimeout(() => handleConfirm(next), 100)
  }

  const handleBackspace = () => {
    if (flow.step === 'error') return
    if (flow.step === 'enter') setFlow({ step: 'enter', digits: flow.digits.slice(0, -1) })
    if (flow.step === 'confirm') setFlow({ step: 'confirm', firstEntry: flow.firstEntry, digits: flow.digits.slice(0, -1) })
  }

  const handleConfirm = (pin: string) => {
    if (mode === 'verify') {
      if (verifyPin(pin)) { onSuccess() }
      else { triggerShake(); setFlow({ step: 'error', message: 'Wrong PIN' }) }
      return
    }
    if (flow.step === 'enter') {
      setFlow({ step: 'confirm', firstEntry: pin, digits: '' })
    } else if (flow.step === 'confirm') {
      if (pin === flow.firstEntry) { setParentPin(pin); onSuccess() }
      else { triggerShake(); setFlow({ step: 'error', message: "PINs didn't match — try again" }) }
    }
  }

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500) }

  const title =
    mode === 'verify' ? 'Parent Area 🔒'
    : flow.step === 'confirm' ? 'Confirm PIN 🔒'
    : flow.step === 'error' ? 'Try Again'
    : getParentPin() ? 'Change PIN 🔒' : 'Create PIN 🔒'

  const subtitle =
    flow.step === 'error' ? flow.message
    : mode === 'verify' ? 'Enter your PIN'
    : flow.step === 'confirm' ? 'Re-enter to confirm'
    : 'Choose a 4-digit PIN'

  const currentDigits = flow.step === 'error' ? '' : flow.digits

  return (
    <div className="screen screen-enter">
      <div className="col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, gap: 24 }}>
        <button className="iconbtn" style={{ alignSelf: 'flex-start' }} onClick={onCancel}>✕</button>

        <div style={{ textAlign: 'center' }}>
          <div className="h-title">{title}</div>
          <div style={{ fontSize: 14, color: flow.step === 'error' ? 'var(--wrong)' : 'var(--muted)', marginTop: 6, fontWeight: 600 }}>
            {subtitle}
          </div>
        </div>

        <div className={`pin-dots${shake ? ' shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`pin-dot${currentDigits.length > i ? ' on' : ''}${flow.step === 'error' ? ' err' : ''}`}
            />
          ))}
        </div>

        <div className="pinpad">
          {['1','2','3','4','5','6','7','8','9','⌫','0','✓'].map((key, idx) => {
            const isBackspace = key === '⌫'
            const isConfirm = key === '✓'
            const isDisabled = isConfirm && currentDigits.length < 4
            return (
              <button
                key={idx}
                className="pinkey"
                disabled={isDisabled}
                style={isDisabled ? { opacity: 0.4 } : {}}
                onClick={() => {
                  if (isBackspace) handleBackspace()
                  else if (isConfirm) handleConfirm(currentDigits)
                  else handleDigit(key)
                }}
              >
                {key}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
