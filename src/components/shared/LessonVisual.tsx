'use client'

import React from 'react'
import type { LessonVisual as LessonVisualData } from '@/lib/lessons'
import type { Theme } from '@/lib/themes'
import { DotsDisplay } from '@/components/shared/DotsDisplay'

/**
 * Renders a lesson step's visual. Three kinds:
 *  - groups: N clusters of M themed emoji (the equal-groups bridge for ×/÷)
 *  - syntheticProblem: delegate to DotsDisplay (counting/addition/subtraction)
 *  - expression: a large formatted equation, styled like the in-game equation
 */
export function LessonVisual({
  visual,
  theme,
}: {
  visual: LessonVisualData
  theme: Theme
}) {
  if (visual.kind === 'syntheticProblem') {
    return <DotsDisplay problem={visual.problem} theme={theme} />
  }

  if (visual.kind === 'expression') {
    return (
      <div
        className="equation"
        style={{ marginTop: 16, fontWeight: 900, color: 'var(--fg)' }}
      >
        <span className="num-big" style={{ fontSize: 'clamp(38px, 9vw, 58px)' }}>
          {visual.text}
        </span>
      </div>
    )
  }

  // visual.kind === 'groups' — N equal groups of M themed emoji.
  // Sizing mirrors DotsDisplay so the emoji feel consistent across screens.
  const dotSize = visual.per > 5 ? 22 : 26
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

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
      {Array.from({ length: visual.groups }).map((_, g) => (
        <div
          key={g}
          className="flex flex-wrap justify-center gap-1"
          style={{
            padding: 8,
            borderRadius: 16,
            border: '2px dashed var(--border)',
            maxWidth: dotSize * 2 + 8,
          }}
        >
          {Array.from({ length: visual.per }).map((_, i) => (
            <span key={i} style={dotStyle}>
              {theme.dotEmoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
