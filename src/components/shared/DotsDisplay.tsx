'use client'

import React from 'react'
import { Problem } from '@/lib/problems'
import { Theme } from '@/lib/themes'

export function DotsDisplay({ problem, theme }: { problem: Problem; theme: Theme }) {
  // Constrain bounding box so emoji aspect-ratio variation across OS/browsers
  // doesn't break the grid layout.
  const dotSize = problem.operand1 > 10 ? 20 : problem.operand1 > 5 ? 22 : 26
  const dotStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dotSize,
    height: dotSize,
    fontSize: dotSize * 0.85,
    lineHeight: 1,
    flexShrink: 0,
  }
  const gridWidth = `${dotSize * 5 + 4 * 4}px`

  if (problem.type === 'counting') {
    return (
      <div className="flex justify-center mt-4">
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: gridWidth }}>
          {Array.from({ length: problem.operand1 }).map((_, i) => (
            <span key={i} style={dotStyle}>{theme.dotEmoji}</span>
          ))}
        </div>
      </div>
    )
  }

  if (problem.type === 'addition' && problem.operand2 !== null) {
    return (
      <div className="flex items-center gap-4 justify-center mt-4 flex-wrap">
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: gridWidth }}>
          {Array.from({ length: problem.operand1 }).map((_, i) => (
            <span key={i} style={dotStyle}>{theme.dotEmoji}</span>
          ))}
        </div>
        <span className="text-3xl font-bold text-slate-500">+</span>
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: gridWidth }}>
          {Array.from({ length: problem.operand2 }).map((_, i) => (
            <span key={i} style={dotStyle}>{theme.dotEmoji}</span>
          ))}
        </div>
      </div>
    )
  }

  if (problem.type === 'subtraction' && problem.operand2 !== null) {
    const kept = problem.operand1 - problem.operand2
    return (
      <div className="flex items-center gap-3 justify-center mt-4 flex-wrap">
        {/* All operand1 dots: theme emoji for kept, ❌ for removed */}
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: `${dotSize * 6 + 5 * 4}px` }}>
          {Array.from({ length: problem.operand1 }).map((_, i) => (
            <span key={i} style={{ ...dotStyle, opacity: i < kept ? 1 : 0.5 }}>
              {i < kept ? theme.dotEmoji : '❌'}
            </span>
          ))}
        </div>
        <span className="text-3xl font-bold text-slate-500">−</span>
        <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: gridWidth }}>
          {Array.from({ length: problem.operand2 }).map((_, i) => (
            <span key={i} style={dotStyle}>❌</span>
          ))}
        </div>
      </div>
    )
  }

  return null
}
