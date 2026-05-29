import { availableStars, canAfford, getItemAt, placeItem, removeItem, GRID_SIZE } from '@/lib/world'
import { CatalogItem } from '@/lib/catalog'
import { PlacedItem } from '@/lib/storage'

const fakeItem = (id = 'test_item'): CatalogItem => ({
  id,
  name: 'Test Item',
  emoji: '🧪',
  price: 10,
  themeKey: 'dinosaurs',
  tier: 'common',
})

const profile = (totalStars: number, spentStars: number) => ({ totalStars, spentStars })

describe('availableStars', () => {
  it('returns totalStars minus spentStars', () => {
    expect(availableStars(profile(100, 30))).toBe(70)
  })

  it('never goes below zero', () => {
    expect(availableStars(profile(10, 50))).toBe(0)
  })

  it('returns totalStars when spentStars is 0', () => {
    expect(availableStars(profile(42, 0))).toBe(42)
  })
})

describe('canAfford', () => {
  it('returns true when balance >= price', () => {
    expect(canAfford(profile(50, 20), 30)).toBe(true)
  })

  it('returns true when balance equals price exactly', () => {
    expect(canAfford(profile(30, 0), 30)).toBe(true)
  })

  it('returns false when balance < price', () => {
    expect(canAfford(profile(50, 45), 10)).toBe(false)
  })
})

describe('getItemAt', () => {
  const world: PlacedItem[] = [
    { itemId: 'a', x: 0, y: 0 },
    { itemId: 'b', x: 3, y: 2 },
  ]

  it('finds an item at the correct coordinates', () => {
    expect(getItemAt(world, 3, 2)?.itemId).toBe('b')
  })

  it('returns undefined for an empty cell', () => {
    expect(getItemAt(world, 1, 1)).toBeUndefined()
  })
})

describe('placeItem', () => {
  it('adds item to an empty cell', () => {
    const result = placeItem([], fakeItem(), 2, 3)
    expect(Array.isArray(result)).toBe(true)
    const placed = result as PlacedItem[]
    expect(placed).toHaveLength(1)
    expect(placed[0]).toMatchObject({ itemId: 'test_item', x: 2, y: 3 })
  })

  it('returns occupied when cell is taken', () => {
    const world: PlacedItem[] = [{ itemId: 'existing', x: 1, y: 1 }]
    expect(placeItem(world, fakeItem(), 1, 1)).toBe('occupied')
  })

  it('returns out_of_bounds for negative x', () => {
    expect(placeItem([], fakeItem(), -1, 0)).toBe('out_of_bounds')
  })

  it('returns out_of_bounds for x >= GRID_SIZE', () => {
    expect(placeItem([], fakeItem(), GRID_SIZE, 0)).toBe('out_of_bounds')
  })

  it('returns out_of_bounds for negative y', () => {
    expect(placeItem([], fakeItem(), 0, -1)).toBe('out_of_bounds')
  })

  it('returns out_of_bounds for y >= GRID_SIZE', () => {
    expect(placeItem([], fakeItem(), 0, GRID_SIZE)).toBe('out_of_bounds')
  })

  it('allows placement at grid boundary (GRID_SIZE - 1)', () => {
    const result = placeItem([], fakeItem(), GRID_SIZE - 1, GRID_SIZE - 1)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('removeItem', () => {
  it('removes the item at the given coordinates', () => {
    const world: PlacedItem[] = [
      { itemId: 'a', x: 0, y: 0 },
      { itemId: 'b', x: 1, y: 1 },
    ]
    const result = removeItem(world, 0, 0)
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe('b')
  })

  it('is a no-op when nothing is at the coordinates', () => {
    const world: PlacedItem[] = [{ itemId: 'a', x: 0, y: 0 }]
    const result = removeItem(world, 3, 3)
    expect(result).toHaveLength(1)
  })

  it('returns an empty array when removing the only item', () => {
    const world: PlacedItem[] = [{ itemId: 'a', x: 2, y: 2 }]
    expect(removeItem(world, 2, 2)).toHaveLength(0)
  })
})

describe('grid invariant', () => {
  it('no two items share the same cell after multiple placements', () => {
    let world: PlacedItem[] = []
    const positions = [
      [0, 0], [1, 0], [2, 0], [0, 1], [1, 1],
    ]
    for (const [x, y] of positions) {
      const result = placeItem(world, fakeItem(`item_${x}_${y}`), x, y)
      expect(Array.isArray(result)).toBe(true)
      world = result as PlacedItem[]
    }

    const coords = world.map(i => `${i.x},${i.y}`)
    const unique = new Set(coords)
    expect(unique.size).toBe(world.length)
  })

  it('attempting to occupy an occupied cell does not mutate world', () => {
    const world: PlacedItem[] = [{ itemId: 'orig', x: 0, y: 0 }]
    const result = placeItem(world, fakeItem('new'), 0, 0)
    expect(result).toBe('occupied')
    expect(world).toHaveLength(1)
    expect(world[0].itemId).toBe('orig')
  })
})
