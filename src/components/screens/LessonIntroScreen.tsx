'use client'

import React, { useState } from 'react'
import { Level } from '@/lib/curriculum'
import { Theme } from '@/lib/themes'
import { getLessonForLevel } from '@/lib/lessons'
import { LessonVisual } from '@/components/shared/LessonVisual'

/**
 * Concept-intro carousel shown before a child's first session on a level that
 * introduces a new operation. Walks through the lesson steps (bridge → worked
 * example → "your turn"), then starts practice. Replayable from the
 * session-complete screen when a child struggles.
 */
export function LessonIntroScreen({
  level,
  theme,
  onStart,
  onExit,
}: {
  level: Level
  theme: Theme
  onStart: () => void
  onExit: () => void
}) {
  const lesson = getLessonForLevel(level.id, theme)
  const [stepIndex, setStepIndex] = useState(0)

  // Defensive: this screen should only be routed to when a lesson exists.
  if (!lesson || lesson.steps.length === 0) {
    onStart()
    return null
  }

  const step = lesson.steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === lesson.steps.length - 1

  return (
    <div className="screen screen-enter">
      <div className="col" style={{ paddingTop: 16 }}>
        {/* Top bar */}
        <div className="game-top">
          <button className="iconbtn" onClick={onExit} aria-label="Close lesson">✕</button>
          <div className="level-badge" style={{ background: level.color }}>
            {level.icon} {level.name}
          </div>
          <div style={{ width: 36 }} />
        </div>

        {/* Step progress dots */}
        <div className="flex gap-1 justify-center" style={{ marginTop: 12 }}>
          {lesson.steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: 14,
                height: 14,
                backgroundColor:
                  i < stepIndex ? '#22C55E' : i === stepIndex ? '#FBBF24' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        {/* Lesson card */}
        <div className="problem-card bounce-in" style={{ marginTop: 16, textAlign: 'center' }} key={stepIndex}>
          <div className="label" style={{ marginBottom: 8 }}>
            Learn it · Step {stepIndex + 1} of {lesson.steps.length}
          </div>
          <div className="h-title" style={{ fontSize: 22 }}>{step.title}</div>
          <div className="narration" style={{ fontSize: 17, marginTop: 10 }}>{step.body}</div>
          {step.visual && <LessonVisual visual={step.visual} theme={theme} />}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 20 }}>
          {!isFirst && (
            <button
              className="btn-ghost"
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => setStepIndex(i => Math.max(0, i - 1))}
            >
              ← Back
            </button>
          )}
          {isLast ? (
            <button className="btn-primary" style={{ flex: 2 }} onClick={onStart}>
              Let&apos;s try! →
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ flex: 2 }}
              onClick={() => setStepIndex(i => Math.min(lesson.steps.length - 1, i + 1))}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
