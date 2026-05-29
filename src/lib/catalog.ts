export type ItemTier = 'common' | 'uncommon' | 'rare'

export interface CatalogItem {
  id: string       // unique snake_case ID
  name: string
  emoji: string
  price: number    // common 5–10, uncommon 15–25, rare 30–50
  themeKey: string
  tier: ItemTier
}

export const ITEM_CATALOG: CatalogItem[] = [
  // ── Dinosaurs ─────────────────────────────────────────────
  { id: 'dino_egg_nest',   name: 'Egg Nest',     emoji: '🪺', price:  5, themeKey: 'dinosaurs', tier: 'common' },
  { id: 'dino_fern',       name: 'Fern Tree',    emoji: '🌿', price:  8, themeKey: 'dinosaurs', tier: 'common' },
  { id: 'dino_bone',       name: 'Bone',         emoji: '🦴', price:  6, themeKey: 'dinosaurs', tier: 'common' },
  { id: 'dino_footprint',  name: 'Footprint',    emoji: '🐾', price:  7, themeKey: 'dinosaurs', tier: 'common' },
  { id: 'dino_volcano',    name: 'Volcano',      emoji: '🌋', price: 20, themeKey: 'dinosaurs', tier: 'uncommon' },
  { id: 'dino_fossil',     name: 'Fossil',       emoji: '🦕', price: 18, themeKey: 'dinosaurs', tier: 'uncommon' },
  { id: 'dino_cave',       name: 'Cave',         emoji: '🕳️', price: 22, themeKey: 'dinosaurs', tier: 'uncommon' },
  { id: 'dino_meteor',     name: 'Meteor',       emoji: '☄️', price: 35, themeKey: 'dinosaurs', tier: 'rare' },
  { id: 'dino_trex_skull', name: 'T-Rex Skull',  emoji: '💀', price: 40, themeKey: 'dinosaurs', tier: 'rare' },
  { id: 'dino_ancient_egg',name: 'Ancient Egg',  emoji: '🥚', price: 45, themeKey: 'dinosaurs', tier: 'rare' },

  // ── Space ─────────────────────────────────────────────────
  { id: 'space_satellite',  name: 'Satellite',      emoji: '🛰️', price:  6, themeKey: 'space', tier: 'common' },
  { id: 'space_moon_rock',  name: 'Moon Rock',      emoji: '🌕', price:  8, themeKey: 'space', tier: 'common' },
  { id: 'space_comet',      name: 'Comet',          emoji: '☄️', price:  7, themeKey: 'space', tier: 'common' },
  { id: 'space_planet',     name: 'Planet',         emoji: '🪐', price:  9, themeKey: 'space', tier: 'common' },
  { id: 'space_station',    name: 'Space Station',  emoji: '🚀', price: 20, themeKey: 'space', tier: 'uncommon' },
  { id: 'space_black_hole', name: 'Black Hole',     emoji: '🕳️', price: 18, themeKey: 'space', tier: 'uncommon' },
  { id: 'space_telescope',  name: 'Telescope',      emoji: '🔭', price: 22, themeKey: 'space', tier: 'uncommon' },
  { id: 'space_alien',      name: 'Alien',          emoji: '👽', price: 45, themeKey: 'space', tier: 'rare' },
  { id: 'space_nebula',     name: 'Nebula',         emoji: '🌌', price: 38, themeKey: 'space', tier: 'rare' },
  { id: 'space_supernova',  name: 'Supernova',      emoji: '🌟', price: 48, themeKey: 'space', tier: 'rare' },

  // ── Ocean ─────────────────────────────────────────────────
  { id: 'ocean_seashell',    name: 'Seashell',       emoji: '🐚', price:  5, themeKey: 'ocean', tier: 'common' },
  { id: 'ocean_starfish',    name: 'Starfish',       emoji: '⭐', price:  7, themeKey: 'ocean', tier: 'common' },
  { id: 'ocean_crab',        name: 'Crab',           emoji: '🦀', price:  8, themeKey: 'ocean', tier: 'common' },
  { id: 'ocean_fish',        name: 'Fish',           emoji: '🐠', price:  6, themeKey: 'ocean', tier: 'common' },
  { id: 'ocean_coral',       name: 'Coral Reef',     emoji: '🪸', price: 15, themeKey: 'ocean', tier: 'uncommon' },
  { id: 'ocean_treasure',    name: 'Treasure Chest', emoji: '📦', price: 22, themeKey: 'ocean', tier: 'uncommon' },
  { id: 'ocean_jellyfish',   name: 'Jellyfish',      emoji: '🪼', price: 18, themeKey: 'ocean', tier: 'uncommon' },
  { id: 'ocean_giant_clam',  name: 'Giant Clam',     emoji: '🦪', price: 35, themeKey: 'ocean', tier: 'rare' },
  { id: 'ocean_sunken_ship', name: 'Sunken Ship',    emoji: '⛵', price: 42, themeKey: 'ocean', tier: 'rare' },
  { id: 'ocean_whale',       name: 'Blue Whale',     emoji: '🐋', price: 48, themeKey: 'ocean', tier: 'rare' },

  // ── Jungle ───────────────────────────────────────────────
  { id: 'jungle_banana',      name: 'Banana',        emoji: '🍌', price:  5, themeKey: 'jungle', tier: 'common' },
  { id: 'jungle_mushroom',    name: 'Mushroom',      emoji: '🍄', price:  7, themeKey: 'jungle', tier: 'common' },
  { id: 'jungle_parrot',      name: 'Parrot',        emoji: '🦜', price:  8, themeKey: 'jungle', tier: 'common' },
  { id: 'jungle_frog',        name: 'Frog',          emoji: '🐸', price:  6, themeKey: 'jungle', tier: 'common' },
  { id: 'jungle_monkey',      name: 'Monkey Swing',  emoji: '🐒', price: 18, themeKey: 'jungle', tier: 'uncommon' },
  { id: 'jungle_giant_flower',name: 'Giant Flower',  emoji: '🌺', price: 20, themeKey: 'jungle', tier: 'uncommon' },
  { id: 'jungle_waterfall',   name: 'Waterfall',     emoji: '💧', price: 22, themeKey: 'jungle', tier: 'uncommon' },
  { id: 'jungle_ancient_tree',name: 'Ancient Tree',  emoji: '🌳', price: 40, themeKey: 'jungle', tier: 'rare' },
  { id: 'jungle_golden_idol', name: 'Golden Idol',   emoji: '🏺', price: 45, themeKey: 'jungle', tier: 'rare' },
  { id: 'jungle_gorilla',     name: 'Gorilla',       emoji: '🦍', price: 48, themeKey: 'jungle', tier: 'rare' },

  // ── Unicorns ─────────────────────────────────────────────
  { id: 'uni_gem',         name: 'Gem',           emoji: '💎', price:  6, themeKey: 'unicorns', tier: 'common' },
  { id: 'uni_flower',      name: 'Rainbow Flower',emoji: '🌸', price:  8, themeKey: 'unicorns', tier: 'common' },
  { id: 'uni_star',        name: 'Shooting Star', emoji: '🌠', price:  7, themeKey: 'unicorns', tier: 'common' },
  { id: 'uni_butterfly',   name: 'Butterfly',     emoji: '🦋', price:  9, themeKey: 'unicorns', tier: 'common' },
  { id: 'uni_wand',        name: 'Magic Wand',    emoji: '✨', price: 16, themeKey: 'unicorns', tier: 'uncommon' },
  { id: 'uni_crystal_ball',name: 'Crystal Ball',  emoji: '🔮', price: 22, themeKey: 'unicorns', tier: 'uncommon' },
  { id: 'uni_cloud',       name: 'Magic Cloud',   emoji: '☁️', price: 18, themeKey: 'unicorns', tier: 'uncommon' },
  { id: 'uni_rainbow',     name: 'Rainbow Bridge',emoji: '🌈', price: 38, themeKey: 'unicorns', tier: 'rare' },
  { id: 'uni_golden_horn', name: 'Golden Horn',   emoji: '🦄', price: 48, themeKey: 'unicorns', tier: 'rare' },
  { id: 'uni_moon',        name: 'Enchanted Moon',emoji: '🌙', price: 42, themeKey: 'unicorns', tier: 'rare' },

  // ── Robots ───────────────────────────────────────────────
  { id: 'robot_gear',      name: 'Gear',          emoji: '⚙️', price:  5, themeKey: 'robots', tier: 'common' },
  { id: 'robot_battery',   name: 'Battery',       emoji: '🔋', price:  7, themeKey: 'robots', tier: 'common' },
  { id: 'robot_bolt',      name: 'Bolt',          emoji: '🔩', price:  6, themeKey: 'robots', tier: 'common' },
  { id: 'robot_screen',    name: 'Screen',        emoji: '📺', price:  8, themeKey: 'robots', tier: 'common' },
  { id: 'robot_circuit',   name: 'Circuit Board', emoji: '💡', price: 18, themeKey: 'robots', tier: 'uncommon' },
  { id: 'robot_power_core',name: 'Power Core',    emoji: '⚡', price: 20, themeKey: 'robots', tier: 'uncommon' },
  { id: 'robot_antenna',   name: 'Antenna',       emoji: '📡', price: 22, themeKey: 'robots', tier: 'uncommon' },
  { id: 'robot_mega',      name: 'Mega Robot',    emoji: '🤖', price: 42, themeKey: 'robots', tier: 'rare' },
  { id: 'robot_tower',     name: 'Control Tower', emoji: '🗼', price: 38, themeKey: 'robots', tier: 'rare' },
  { id: 'robot_arm',       name: 'Cyber Arm',     emoji: '🦾', price: 45, themeKey: 'robots', tier: 'rare' },

  // ── Cats ─────────────────────────────────────────────────
  { id: 'cat_yarn',        name: 'Ball of Yarn',  emoji: '🧶', price:  5, themeKey: 'cats', tier: 'common' },
  { id: 'cat_toy_fish',    name: 'Cat Toy',       emoji: '🐟', price:  7, themeKey: 'cats', tier: 'common' },
  { id: 'cat_pawprint',    name: 'Paw Print',     emoji: '🐾', price:  6, themeKey: 'cats', tier: 'common' },
  { id: 'cat_milk',        name: 'Milk Bowl',     emoji: '🥛', price:  8, themeKey: 'cats', tier: 'common' },
  { id: 'cat_scratch_post',name: 'Scratch Post',  emoji: '🪵', price: 16, themeKey: 'cats', tier: 'uncommon' },
  { id: 'cat_bed',         name: 'Cat Bed',       emoji: '🛏️', price: 20, themeKey: 'cats', tier: 'uncommon' },
  { id: 'cat_window',      name: 'Sunny Window',  emoji: '🪟', price: 18, themeKey: 'cats', tier: 'uncommon' },
  { id: 'cat_crown',       name: 'Crown',         emoji: '👑', price: 45, themeKey: 'cats', tier: 'rare' },
  { id: 'cat_magic',       name: 'Magic Cat',     emoji: '🐈', price: 40, themeKey: 'cats', tier: 'rare' },
  { id: 'cat_castle',      name: 'Cat Castle',    emoji: '🏰', price: 48, themeKey: 'cats', tier: 'rare' },
]
