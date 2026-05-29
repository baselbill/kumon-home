'use client'

import React, { useState } from 'react'
import { ITEM_CATALOG, CatalogItem, ItemTier } from '@/lib/catalog'
import { Theme } from '@/lib/themes'

const TIER_ORDER: ItemTier[] = ['common', 'uncommon', 'rare']
const TIER_LABEL: Record<ItemTier, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
}

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

  const grouped = TIER_ORDER.map(tier => ({
    tier,
    items: items.filter(i => i.tier === tier),
  }))

  const selectedItem = items.find(i => i.id === selectedId) ?? null

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-900 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.07] sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 active:text-slate-200 active:scale-90 transition-all"
        >
          ⬅
        </button>
        <div className="text-xl font-bold text-slate-100">🛒 Shop</div>
        <div className="flex items-center gap-1 text-amber-400 font-bold">
          <span>⭐</span>
          <span>{availableStars}</span>
        </div>
      </div>

      {/* Scrollable catalog */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-6">
        {grouped.map(({ tier, items: tierItems }) => (
          <div key={tier}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              {TIER_LABEL[tier]}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tierItems.map(item => {
                const affordable = availableStars >= item.price
                const isSelected = selectedId === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!affordable) return
                      setSelectedId(isSelected ? null : item.id)
                    }}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400'
                        : affordable
                        ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        : 'bg-slate-800/50 border-slate-800 opacity-50'
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className={`text-xs font-semibold text-center leading-tight ${
                      affordable ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {item.name}
                    </span>
                    <div className={`flex items-center gap-1 text-sm font-bold rounded-full px-2 py-0.5 ${
                      affordable
                        ? isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-amber-400'
                        : 'bg-slate-800 text-slate-600'
                    }`}>
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

      {/* Sticky place button */}
      {selectedItem && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 bg-slate-900/95 backdrop-blur border-t border-white/[0.07]">
          <button
            onClick={() => { onSelectItem(selectedItem); setSelectedId(null) }}
            className="w-full py-4 rounded-2xl bg-amber-400 text-slate-900 font-bold text-lg active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2"
          >
            <span>{selectedItem.emoji}</span>
            <span>Place {selectedItem.name}</span>
            <span className="opacity-70 text-base ml-1">— ⭐ {selectedItem.price}</span>
          </button>
        </div>
      )}
    </div>
  )
}
