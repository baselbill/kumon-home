import { PlacedItem } from '@/lib/storage'
import { CatalogItem } from '@/lib/catalog'

export const GRID_SIZE = 6

export function availableStars(profile: { totalStars: number; spentStars: number }): number {
  return Math.max(0, profile.totalStars - profile.spentStars)
}

export function canAfford(
  profile: { totalStars: number; spentStars: number },
  price: number
): boolean {
  return availableStars(profile) >= price
}

export function getItemAt(world: PlacedItem[], x: number, y: number): PlacedItem | undefined {
  return world.find(item => item.x === x && item.y === y)
}

export function placeItem(
  world: PlacedItem[],
  item: CatalogItem,
  x: number,
  y: number
): PlacedItem[] | 'occupied' | 'out_of_bounds' {
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return 'out_of_bounds'
  if (getItemAt(world, x, y)) return 'occupied'
  return [...world, { itemId: item.id, x, y }]
}

export function removeItem(world: PlacedItem[], x: number, y: number): PlacedItem[] {
  return world.filter(item => !(item.x === x && item.y === y))
}
