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

  // Auto-reset from error state after 1.5s
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

    if (flow.step === 'enter') {
      setFlow({ step: 'enter', digits: next })
    } else if (flow.step === 'confirm') {
      setFlow({ step: 'confirm', firstEntry: flow.firstEntry, digits: next })
    }

    if (next.length === 4) {
      setTimeout(() => handleConfirm(next), 100)
    }
  }

  const handleBackspace = () => {
    if (flow.step === 'error') return
    if (flow.step === 'enter') setFlow({ step: 'enter', digits: flow.digits.slice(0, -1) })
    if (flow.step === 'confirm') setFlow({ step: 'confirm', firstEntry: flow.firstEntry, digits: flow.digits.slice(0, -1) })
  }

  const handleConfirm = (pin: string) => {
    if (mode === 'verify') {
      if (verifyPin(pin)) {
        onSuccess()
      } else {
        triggerShake()
        setFlow({ step: 'error', message: 'Wrong PIN' })
      }
      return
    }

    // mode === 'set'
    if (flow.step === 'enter') {
      setFlow({ step: 'confirm', firstEntry: pin, digits: '' })
    } else if (flow.step === 'confirm') {
      if (pin === flow.firstEntry) {
        setParentPin(pin)
        onSuccess()
      } else {
        triggerShake()
        setFlow({ step: 'error', message: "PINs didn't match — try again" })
      }
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const title =
    mode === 'verify' ? 'Parent Area 🔒'
    : flow.step === 'confirm' ? 'Confirm PIN 🔒'
    : flow.step === 'error' ? 'Try Again'
    : getParentPin() ? 'Change PIN 🔒' : 'Create PIN 🔒'

  const subtitle =
    flow.step === 'error' ? (flow.message)
    : mode === 'verify' ? 'Enter your PIN'
    : flow.step === 'confirm' ? 'Re-enter to confirm'
    : 'Choose a 4-digit PIN'

  const currentDigits = flow.step === 'error' ? '' : flow.digits

  const numpadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['⌫', '0', '✓'],
  ]

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-slate-900 px-6 pt-14 pb-8">
      <button
        onClick={onCancel}
        className="absolute top-4 left-4 p-2 text-slate-400 active:text-slate-200 active:scale-90 transition-all"
      >
        ✕
      </button>

      <div className="text-2xl font-bold text-slate-100 mb-1 mt-4">{title}</div>
      <div className={`text-sm mb-8 transition-colors ${flow.step === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
        {subtitle}
      </div>

      {/* PIN dots */}
      <div className={`flex gap-4 justify-center mb-10 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
              currentDigits.length > i
                ? 'bg-amber-400 border-amber-400'
                : flow.step === 'error'
                ? 'bg-red-400/30 border-red-400'
                : 'bg-transparent border-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {numpadRows.flat().map((key, idx) => {
          const isBackspace = key === '⌫'
          const isConfirm = key === '✓'
          const isDisabled = isConfirm && currentDigits.length < 4

          return (
            <button
              key={idx}
              disabled={isDisabled}
              onClick={() => {
                if (isBackspace) handleBackspace()
                else if (isConfirm) handleConfirm(currentDigits)
                else handleDigit(key)
              }}
              className={`h-16 rounded-2xl text-2xl font-bold border transition-all active:scale-90 ${
                isConfirm
                  ? isDisabled
                    ? 'bg-slate-800 border-slate-700 text-slate-600'
                    : 'bg-green-500/20 border-green-500/40 text-green-400'
                  : isBackspace
                  ? 'bg-slate-700 border-white/10 text-slate-300'
                  : 'bg-slate-700 hover:bg-slate-600 border-white/10 text-slate-100'
              }`}
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
