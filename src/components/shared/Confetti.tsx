'use client'

import React from 'react'

const CONFETTI_COLORS = ['#FF6B6B','#FFE66D','#6BCB77','#4D96FF','#FF6BFF','#FF9F1C']

export function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 8 + Math.random() * 10,
    delay: Math.random() * 1.5,
    duration: 1.8 + Math.random() * 1.4,
  }))

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </>
  )
}
