'use client'

import React from 'react'
import { Level } from '@/lib/curriculum'
import { Problem, narrate } from '@/lib/problems'
import { Theme } from '@/lib/themes'
import { formatDuration } from '@/lib/timing'
import { FeedbackState, FloatingStar } from '@/types/game'
import { DotsDisplay } from '@/components/shared/DotsDisplay'
import { NumberPad } from '@/components/shared/NumberPad'
import { ProgressDots } from '@/components/shared/ProgressDots'
import { Mascot } from '@/components/shared/Mascot'

function ProblemEquation({ problem }: { problem: Problem }) {
  const big = 'text-7xl font-bold text-slate-100'
  const opr = 'text-5xl font-bold text-slate-400 mx-3'
  const eq  = 'text-5xl font-bold text-slate-500 mx-3'

  if (problem.type === 'counting') {
    return (
      <div className="text-center text-2xl font-bold text-slate-300 mb-2">
        How many?
      </div>
    )
  }

  if (problem.type === 'exponent') {
    return (
      <div className="text-center mb-2 flex items-start justify-center gap-0.5">
        <span className={big}>{problem.operand1}</span>
        <sup className="text-2xl font-bold text-slate-100 mt-1 ml-0.5">{problem.operand2}</sup>
        <span className={eq}>=</span>
      </div>
    )
  }

  if (problem.type === 'sqrt') {
    return (
      <div className="text-center mb-2">
        <span className="text-7xl font-bold text-slate-100">√{problem.operand1}</span>
        <span className={eq}>=</span>
      </div>
    )
  }

  if (problem.type === 'percentage') {
    return (
      <div className="text-center mb-2 flex items-center justify-center flex-wrap">
        <span className={big}>{problem.operand1}%</span>
        <span className={opr}>of</span>
        <span className={big}>{problem.operand2}</span>
        <span className={eq}>=</span>
      </div>
    )
  }

  if (problem.type === 'algebra' && problem.displayText) {
    return (
      <div className="text-center mb-2">
        <div className="text-4xl font-bold text-slate-100">{problem.displayText}</div>
        <div className="text-xl text-slate-400 mt-1">x = ?</div>
      </div>
    )
  }

  // Default: addition, subtraction, multiplication, division
  return (
    <div className="text-center mb-2">
      <span className={big}>{problem.operand1}</span>
      <span className={opr}>{problem.operator}</span>
      {problem.operand2 !== null && <span className={big}>{problem.operand2}</span>}
      <span className={eq}>=</span>
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

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto px-4 pt-4 pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onQuit}
          className="p-2 rounded-xl text-slate-500 active:text-slate-300 active:scale-90 transition-all"
          aria-label="Quit session"
        >
          ✕
        </button>
        <div
          className="px-3 py-1 rounded-xl text-white text-sm font-bold"
          style={{ backgroundColor: level.color }}
        >
          {level.icon} {level.name}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-500 text-sm font-mono font-semibold">
            ⏱ {formatDuration(elapsedSec * 1000)}
          </div>
          <div className="flex items-center gap-1 text-yellow-500 font-bold">
            ⭐ {sessionCorrect}
          </div>
        </div>
      </div>

      {/* Progress dots — extends when problems are re-queued */}
      <ProgressDots total={problems.length} current={problemIndex} />

      {/* Problem card */}
      <div
        className={`rounded-3xl p-6 shadow-lg transition-all duration-200 ${
          isCorrect ? 'bg-green-500/10 border-4 border-green-500' :
          isWrong   ? 'bg-red-500/10 border-4 border-red-500' :
          'bg-slate-800 border-4 border-white/10'
        }`}
        style={{ minHeight: '200px', position: 'relative' }}
      >
        {/* Floating stars */}
        {floatingStars.map(s => (
          <div
            key={s.id}
            className="float-star"
            style={{ left: `${s.x}%`, bottom: '60%' }}
          >
            ⭐
          </div>
        ))}

        {/* Themed mascot — shows evolved form */}
        <div className="flex justify-center mb-3">
          <Mascot
            mood={isCorrect ? 'happy' : isWrong ? 'thinking' : 'idle'}
            theme={theme}
            companionStage={companionStage}
          />
        </div>

        {/* Problem text: narrated sentence for readers, equation for non-readers */}
        {readerMode ? (
          <div className="text-center text-xl font-semibold text-slate-400 mb-2 leading-snug">
            {narrate(problem, theme)}
          </div>
        ) : (
          <ProblemEquation problem={problem} />
        )}

        {/* Themed dot display */}
        {showDots && <DotsDisplay problem={problem} theme={theme} />}

        {/* Feedback message */}
        {isCorrect && (
          <div className="text-center mt-3 text-green-600 font-bold text-xl animate-bounce-in">
            {theme.shortFeedback} 🎉
          </div>
        )}
        {isWrong && (
          <div className="text-center mt-3 animate-bounce-in">
            <div className="text-orange-500 font-bold text-lg">The answer is…</div>
            <div className="text-5xl font-bold text-orange-600 mt-1">{problem.answer}</div>
          </div>
        )}
      </div>

      {/* Answer input display */}
      <div
        className={`flex items-center justify-center py-4 text-5xl font-bold border-b-4 bg-transparent transition-all ${
          isCorrect ? 'border-green-500 text-green-400' :
          isWrong   ? 'border-red-500 text-red-400' :
          'border-amber-400 text-slate-100'
        }`}
        style={{ minHeight: '72px' }}
      >
        {userAnswer !== '' ? userAnswer : (
          <span className="text-slate-600 text-3xl">?</span>
        )}
      </div>

      {/* Number pad */}
      <NumberPad
        onDigit={onDigit}
        onBackspace={onBackspace}
        onSubmit={onSubmit}
        disabled={feedback !== 'none'}
      />
    </div>
  )
}
