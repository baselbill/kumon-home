'use client'

import React, { useState } from 'react'
import { ITEM_CATALOG, CatalogItem, ItemTier } from '@/lib/catalog'
import { Theme } from '@/lib/themes'

const TIER_ORDER: ItemTier[] = ['common', 'uncommon', 'rare']
const TIER_LABEL: Record<ItemTier, string> = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare' }
const TIER_COLOR: Record<ItemTier, string> = { common: '#94A3B8', uncommon: '#38BDF8', rare: '#C084FC' }

export function ShopScreen({
  theme,
  availableStars,
  onSelectItem,
  onBack,
}: {
  theme: Theme
  availableStars: number
  onSelectItem: (item: CatalogItem) => void
  onBack: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const items = ITEM_CATALOG.filter(i => i.themeKey === theme.key)
  const grouped = TIER_ORDER.map(tier => ({ tier, items: items.filter(i => i.tier === tier) }))
  const selectedItem = items.find(i => i.id === selectedId) ?? null

  return (
    <div className="screen screen-enter">
      <div className="col col-wide" style={{ paddingBottom: selectedItem ? 110 : 28, maxWidth: 720 }}>
        <div className="row-between" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="iconbtn" onClick={onBack}>←</button>
            <div className="h-title" style={{ fontSize: 24 }}>🛒 Shop</div>
          </div>
          <div className="sess-stars" style={{ fontSize: 16 }}>⭐ {availableStars}</div>
        </div>

        {grouped.map(({ tier, items: tierItems }) => (
          <div key={tier}>
            <div className="tier-head">
              <div className="tier-dot" style={{ background: TIER_COLOR[tier] }} />
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--fg-dim)' }}>{TIER_LABEL[tier]}</div>
            </div>
            <div className="shop-grid">
              {tierItems.map(item => {
                const affordable = availableStars >= item.price
                const isSelected = selectedId === item.id
                return (
                  <button
                    key={item.id}
                    className={`shop-item${isSelected ? ' sel' : ''}${!affordable ? ' poor' : ''}`}
                    onClick={() => { if (!affordable) return; setSelectedId(isSelected ? null : item.id) }}
                  >
                    <div className="em">{item.emoji}</div>
                    <div className="nm">{item.name}</div>
                    <div className={`price${isSelected ? ' sel' : ''}`}>
                      {!affordable && <span>🔒</span>}
                      <span>⭐ {item.price}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 440, padding: 16,
          background: 'var(--surface-glass)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)',
        }}>
          <button
            className="btn-primary"
            onClick={() => { onSelectItem(selectedItem); setSelectedId(null) }}
          >
            {selectedItem.emoji} Place {selectedItem.name} — ⭐ {selectedItem.price}
          </button>
        </div>
      )}
    </div>
  )
}
