'use client'

import React, { useState } from 'react'
import { ProfileSave, PlacedItem } from '@/lib/storage'
import { CatalogItem, ITEM_CATALOG } from '@/lib/catalog'
import { getItemAt, GRID_SIZE } from '@/lib/world'
import { Theme } from '@/lib/themes'

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
    <div className="screen screen-enter">
      <div className="col" style={{ paddingBottom: 28, maxWidth: 560 }}>
        <div className="row-between" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="iconbtn" onClick={pendingItem ? onCancelPending : onBack}>
              {pendingItem ? '✕' : '←'}
            </button>
            <div className="h-title" style={{ fontSize: 24 }}>
              {pendingItem ? `Place ${pendingItem.name}` : `🌍 ${activeProfile.profileName}'s World`}
            </div>
          </div>
          <div className="sess-stars" style={{ fontSize: 16 }}>⭐ {availableStars}</div>
        </div>

        {pendingItem && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 14, fontWeight: 700 }}>
            Tap an empty tile to place {pendingItem.emoji} {pendingItem.name}
          </div>
        )}

        <div className="world-board">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE)
            const placed = getItemAt(world, x, y)
            const catalogItem = placed ? ITEM_CATALOG.find(ci => ci.id === placed.itemId) : undefined
            const isRemoving = removing?.x === x && removing?.y === y
            const isTarget = !!pendingItem && !placed

            return (
              <button
                key={`${x}-${y}`}
                className={`world-cell${isRemoving ? ' removing' : isTarget ? ' target' : catalogItem ? '' : ' empty'}`}
                onClick={() => handleCellTap(x, y, placed)}
              >
                {catalogItem ? (
                  <span>{catalogItem.emoji}</span>
                ) : isTarget ? (
                  <span className="ghost">{pendingItem!.emoji}</span>
                ) : null}
              </button>
            )
          })}
        </div>

        {removing && removingItem && (
          <div className="card" style={{ padding: 14, marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{removingItem.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>Remove {removingItem.name}?</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>No refund</div>
            </div>
            <button
              className="btn-ghost"
              style={{ background: 'var(--wrong)', color: '#fff', padding: '8px 14px' }}
              onClick={() => { onRemove(removing.x, removing.y); setRemoving(null) }}
            >
              Remove
            </button>
            <button
              className="btn-ghost"
              style={{ padding: '8px 14px' }}
              onClick={() => setRemoving(null)}
            >
              Keep
            </button>
          </div>
        )}

        {!pendingItem && (
          <button className="btn-primary" style={{ marginTop: 18 }} onClick={onOpenShop}>
            🛒 Open Shop
          </button>
        )}

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
          {world.length} / {GRID_SIZE * GRID_SIZE} items placed · tap a tile to edit
        </div>
      </div>
    </div>
  )
}
