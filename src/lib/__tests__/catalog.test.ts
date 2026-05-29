import { ITEM_CATALOG } from '@/lib/catalog'
import { PRESET_THEMES } from '@/lib/themes'

const VALID_THEME_KEYS = new Set(PRESET_THEMES.map(t => t.key))

describe('ITEM_CATALOG', () => {
  it('all items have unique IDs', () => {
    const ids = ITEM_CATALOG.map(i => i.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('every themeKey is a valid PRESET_THEMES key', () => {
    for (const item of ITEM_CATALOG) {
      expect(VALID_THEME_KEYS.has(item.themeKey)).toBe(true)
    }
  })

  it('common items are priced 5–10', () => {
    const commons = ITEM_CATALOG.filter(i => i.tier === 'common')
    for (const item of commons) {
      expect(item.price).toBeGreaterThanOrEqual(5)
      expect(item.price).toBeLessThanOrEqual(10)
    }
  })

  it('uncommon items are priced 15–25', () => {
    const uncommons = ITEM_CATALOG.filter(i => i.tier === 'uncommon')
    for (const item of uncommons) {
      expect(item.price).toBeGreaterThanOrEqual(15)
      expect(item.price).toBeLessThanOrEqual(25)
    }
  })

  it('rare items are priced 30–50', () => {
    const rares = ITEM_CATALOG.filter(i => i.tier === 'rare')
    for (const item of rares) {
      expect(item.price).toBeGreaterThanOrEqual(30)
      expect(item.price).toBeLessThanOrEqual(50)
    }
  })

  it('each theme has at least 6 items', () => {
    for (const themeKey of VALID_THEME_KEYS) {
      const themeItems = ITEM_CATALOG.filter(i => i.themeKey === themeKey)
      expect(themeItems.length).toBeGreaterThanOrEqual(6)
    }
  })
})
