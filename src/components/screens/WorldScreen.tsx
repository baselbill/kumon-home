'use client'

import React, { useState } from 'react'
import { ProfileSave, PlacedItem } from '@/lib/storage'
import { CatalogItem, ITEM_CATALOG } from '@/lib/catalog'
import { getItemAt, GRID_SIZE } from '@/lib/world'
import { Theme } from '@/lib/themes'

const CELL_SIZE = 52

export function WorldScreen({
  activeProfile,
  theme,
  availableStars,
  pendingItem,
  onBuyAndPlace,
  onRemove,
  onOpenShop,
  onCancelPending,
  onBack,
}: {
  activeProfile: ProfileSave
  theme: Theme
  availableStars: number
  pendingItem: CatalogItem | null
  onBuyAndPlace: (item: CatalogItem, x: number, y: number) => boolean
  onRemove: (x: number, y: number) => void
  onOpenShop: () => void
  onCancelPending: () => void
  onBack: () => void
}) {
  const world = activeProfile.world ?? []
  const [removing, setRemoving] = useState<{ x: number; y: number } | null>(null)

  const cells = Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => {
      const placed = getItemAt(world, col, row)
      const catalogItem = placed ? ITEM_CATALOG.find(i => i.id === placed.itemId) : undefined
      return { x: col, y: row, placed, catalogItem }
    })
  )

  const handleCellTap = (x: number, y: number, placed: PlacedItem | undefined) => {
    if (pendingItem) {
      const ok = onBuyAndPlace(pendingItem, x, y)
      if (ok) onCancelPending()
      return
    }
    if (placed) {
      setRemoving(prev => (prev?.x === x && prev?.y === y) ? null : { x, y })
    } else {
      onOpenShop()
    }
  }

  const removingItem = removing
    ? ITEM_CATALOG.find(i => i.id === getItemAt(world, removing.x, removing.y)?.itemId)
    : null

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-900 p-4 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={pendingItem ? onCancelPending : onBack}
          className="p-2 text-slate-400 active:text-slate-200 active:scale-90 transition-all"
        >
          {pendingItem ? '✕' : '⬅'}
        </button>
        <div className="text-xl font-bold text-slate-100">
          {pendingItem ? `Place ${pendingItem.name}` : '🌍 My World'}
        </div>
        <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
          <span>⭐</span>
          <span>{availableStars}</span>
        </div>
      </div>

      {pendingItem && (
        <div className="text-center text-sm text-slate-400 mb-3">
          Tap an empty cell to place {pendingItem.emoji} {pendingItem.name}
        </div>
      )}

      {/* 6×6 grid */}
      <div className="flex justify-center mb-5">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)` }}
        >
          {cells.flat().map(({ x, y, placed, catalogItem }) => {
            const isRemoving = removing?.x === x && removing?.y === y
            const isPendingTarget = !!pendingItem && !placed

            return (
              <button
                key={`${x}-${y}`}
                onClick={() => handleCellTap(x, y, placed)}
                className={`flex items-center justify-center rounded-xl transition-all active:scale-90 border-2 ${
                  isRemoving
                    ? 'bg-red-500/20 border-red-500/60'
                    : isPendingTarget
                    ? 'bg-amber-400/10 border-amber-400/40 border-dashed'
                    : placed
                    ? 'bg-slate-800 border-slate-600'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
              >
                {catalogItem ? (
                  <span className="text-2xl select-none">{catalogItem.emoji}</span>
                ) : pendingItem && !placed ? (
                  <span className="text-2xl opacity-30 select-none">{pendingItem.emoji}</span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* Remove confirmation */}
      {removing && removingItem && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="text-3xl">{removingItem.emoji}</span>
          <div className="flex-1">
            <div className="font-bold text-slate-100 text-sm">Remove {removingItem.name}?</div>
            <div className="text-xs text-slate-500">No refund</div>
          </div>
          <button
            onClick={() => { onRemove(removing.x, removing.y); setRemoving(null) }}
            className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-sm font-bold active:scale-95"
          >
            Remove
          </button>
          <button
            onClick={() => setRemoving(null)}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-xl text-sm font-bold active:scale-95"
          >
            Keep
          </button>
        </div>
      )}

      {/* Shop button */}
      {!pendingItem && (
        <button
          onClick={onOpenShop}
          className="w-full py-3 rounded-2xl bg-amber-400 text-slate-900 font-bold text-lg active:scale-95 transition-transform shadow-lg"
        >
          🛒 Shop
        </button>
      )}

      {/* Item count */}
      <div className="text-center text-xs text-slate-600 mt-3">
        {world.length} / {GRID_SIZE * GRID_SIZE} items placed
      </div>
    </div>
  )
}
