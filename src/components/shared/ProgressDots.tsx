'use client'

import React from 'react'

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: total > 15 ? 10 : 14,
            height: total > 15 ? 10 : 14,
            backgroundColor: i < current ? '#22C55E' : i === current ? '#FBBF24' : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  )
}
