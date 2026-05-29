'use client'

import React, { useRef, useEffect } from 'react'
import { Level } from '@/lib/curriculum'
import { Problem, narrate } from '@/lib/problems'
import { Theme } from '@/lib/themes'
import { formatDuration } from '@/lib/timing'
import { FeedbackState, FloatingStar } from '@/types/game'
import { DotsDisplay } from '@/components/shared/DotsDisplay'
import { NumberPad } from '@/components/shared/NumberPad'
import { ProgressDots } from '@/components/shared/ProgressDots'
import { Mascot } from '@/components/shared/Mascot'

function Equation({ problem }: { problem: Problem }) {
  if (problem.type === 'counting') {
    return <div className="howmany">How many?</div>
  }
  if (problem.type === 'exponent') {
    return (
      <div className="equation">
        <span className="num-big">{problem.operand1}</span>
        <span className="exp-sup">{problem.operand2}</span>
        <span className="num-eq">=</span>
      </div>
    )
  }
  if (problem.type === 'sqrt') {
    return (
      <div className="equation">
        <span className="num-big">√{problem.operand1}</span>
        <span className="num-eq">=</span>
      </div>
    )
  }
  if (problem.type === 'percentage') {
    return (
      <div className="equation">
        <span className="num-big">{problem.operand1}%</span>
        <span className="num-op">of</span>
        <span className="num-big">{problem.operand2}</span>
        <span className="num-eq">=</span>
      </div>
    )
  }
  if (problem.type === 'algebra' && problem.displayText) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 46, fontWeight: 900, color: 'var(--fg)' }}>{problem.displayText}</div>
        <div style={{ fontSize: 20, color: 'var(--muted)', marginTop: 6, fontWeight: 700 }}>x = ?</div>
      </div>
    )
  }
  return (
    <div className="equation">
      <span className="num-big">{problem.operand1}</span>
      <span className="num-op">{problem.operator}</span>
      {problem.operand2 !== null && <span className="num-big">{problem.operand2}</span>}
      <span className="num-eq">=</span>
    </div>
  )
}

export function GameScreen({
  level,
  problems,
  problemIndex,
  userAnswer,
  feedback,
  sessionCorrect,
  floatingStars,
  theme,
  companionStage,
  readerMode,
  showDots,
  elapsedSec,
  onDigit,
  onBackspace,
  onSubmit,
  onQuit,
}: {
  level: Level
  problems: Problem[]
  problemIndex: number
  userAnswer: string
  feedback: FeedbackState
  sessionCorrect: number
  floatingStars: FloatingStar[]
  theme: Theme
  companionStage: number
  readerMode: boolean
  showDots: boolean
  elapsedSec: number
  onDigit: (d: number) => void
  onBackspace: () => void
  onSubmit: () => void
  onQuit: () => void
}) {
  const problem = problems[problemIndex]
  if (!problem) return null

  const isCorrect = feedback === 'correct'
  const isWrong   = feedback === 'wrong'

  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (isWrong && cardRef.current) {
      cardRef.current.classList.remove('shake')
      void cardRef.current.offsetWidth
      cardRef.current.classList.add('shake')
    }
  }, [isWrong])

  return (
    <div className="screen screen-enter">
      <div className="col col-wide game-wrap" style={{ paddingTop: 16 }}>
        {/* Top bar */}
        <div className="game-top">
          <button className="iconbtn" onClick={onQuit} aria-label="Quit session">✕</button>
          <div className="level-badge" style={{ background: level.color }}>
            {level.icon} {level.name}
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="timer">⏱ {formatDuration(elapsedSec * 1000)}</div>
            <div className="sess-stars">⭐ {sessionCorrect}</div>
          </div>
        </div>

        {/* Progress segments */}
        <div className="prog">
          {problems.map((_, i) => (
            <div
              key={i}
              className={`seg${i < problemIndex ? ' done' : i === problemIndex ? ' cur' : ''}`}
            />
          ))}
        </div>

        {/* 2-col on desktop */}
        <div className="game-grid">
          {/* Problem card */}
          <div
            ref={cardRef}
            className={`problem-card${isCorrect ? ' correct' : isWrong ? ' wrong' : ''}`}
          >
            {floatingStars.map(s => (
              <div key={s.id} className="float-star" style={{ left: `${s.x}%`, bottom: '55%' }}>⭐</div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <Mascot
                mood={isCorrect ? 'happy' : isWrong ? 'thinking' : 'idle'}
                theme={theme}
                companionStage={companionStage}
              />
            </div>

            {readerMode ? (
              <div className="narration">{narrate(problem, theme)}</div>
            ) : (
              <Equation problem={problem} />
            )}

            {showDots && <DotsDisplay problem={problem} theme={theme} />}

            {isCorrect && (
              <div className="fb-correct bounce-in" style={{ marginTop: 14 }}>
                {theme.shortFeedback} 🎉
              </div>
            )}
            {isWrong && (
              <div className="fb-wrong bounce-in" style={{ marginTop: 14 }}>
                <div className="lbl">The answer is…</div>
                <div className="ans">{problem.answer}</div>
              </div>
            )}
          </div>

          {/* Answer + numpad */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className={`answer${isCorrect ? ' correct' : isWrong ? ' wrong' : ''}`}>
              {userAnswer !== '' ? userAnswer : <span className="ph">?</span>}
            </div>
            <NumberPad
              onDigit={onDigit}
              onBackspace={onBackspace}
              onSubmit={onSubmit}
              disabled={feedback !== 'none'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
