# Implementation Plan — The Living World System

Four sprints that turn the static theme skin into a world that grows with the child.

| Sprint | Name | Goal | Effort | Risk |
|---|---|---|---|---|
| 0 | The Journey | Narrative beats + named locations | 1–2 days | Very low |
| 1 | Foundations | Component split, state hook, save migration | 2–3 days | Medium (regression) |
| 2 | The Companion | Mascot evolution + companion collection | 3–5 days | Medium |
| 3 | The Homeland | Star economy + buildable world | 1–2 weeks | High |

**Guiding rules**
- The library layer (`storage.ts`, `curriculum.ts`, `problems.ts`, `themes.ts`) is clean and well-tested. Touch it **additively only**.
- Every `ProfileSave` change ships with a migration. Never let an existing save read `undefined` from a new required field.
- Each sprint ends green: `npm run build` + `npm test` pass, and the app is shippable. No sprint leaves the product broken.
- Each sprint = one PR, reviewed and merged before the next begins.

---

## Sprint 0 — The Journey

**Why first:** Pure content + light UI. No data-model or architecture changes. Ships the "world feels alive" win immediately while the bigger scaffolding is still being planned.

### Data
1. `src/lib/themes.ts` — add to the `Theme` interface (additive, optional-safe):
   ```ts
   export interface ThemeLocation {
     name: string                 // "Egg Valley"
     levelRange: [number, number] // [1, 5]
     storyHook: string            // shown on level-complete within this tier
     icon: string                 // emoji for the location
   }
   // Theme gains: locations: ThemeLocation[]  // exactly 4, covering levels 1–20
   ```
2. Author 4 locations × 7 themes = 28 location entries + revisit each theme's `celebrationLine`. ~30 strings of copy.
3. Helper: `getLocationForLevel(theme, levelId): ThemeLocation`.

### UI
4. **Journey strip (HomeScreen):** the existing 20-dot strip gains the current location name floating above it ("📍 Fern Forest").
5. **Level-complete:** swap generic `unlockMessage` for `getLocationForLevel(theme, levelId).storyHook`.
6. **Location crossing:** when a level-up crosses a tier boundary (5→6, 10→11, 15→16, 20), show an enlarged "You reached {Location}!" banner on the level-complete screen.

### Tests
- `themes.test.ts`: every theme has exactly 4 locations; ranges are contiguous and cover 1–20 with no gaps/overlaps.
- `getLocationForLevel` returns correct location at boundaries (5, 6, 10, 11, 20).

### Acceptance criteria
- [ ] Each theme shows a distinct location name as the child advances.
- [ ] Level-complete copy is theme- and tier-specific, not generic.
- [ ] Crossing into a new location is visibly bigger than a normal level-up.
- [ ] No new persisted state; existing saves unaffected.

---

## Sprint 1 — Foundations (architecture)

**Why second:** Layers 2 and 3 are not safely buildable inside the 2,058-line `MathGame.tsx`. This sprint adds no user-facing features — it is pure refactor + migration scaffolding. Ship behind a green test suite.

### 1A. Component split
Extract each screen out of `MathGame.tsx` into `src/components/screens/`:
```
screens/HomeScreen.tsx
screens/GameScreen.tsx
screens/LevelSelectScreen.tsx
screens/AchievementsScreen.tsx
screens/SessionCompleteScreen.tsx
screens/LevelCompleteScreen.tsx
components/shared/  (Mascot, NumberPad, ProgressDots, Confetti, BottomNav, etc.)
```
`MathGame.tsx` shrinks to a ~200-line orchestrator: holds `screen` state, renders the active screen, wires callbacks.

### 1B. State hook
```ts
// src/hooks/useGameState.ts
export function useGameState() {
  // owns: profiles, activeProfileId, session state
  // exposes: activeProfile, startSession, endSession, switchProfile,
  //          updateProfile, and (added in later sprints) spendStars, placeItem...
}
```
All mutation logic moves out of the component into this hook. Screens receive data + callbacks; they never reach into raw `setProfiles`.

### 1C. Save migration
```ts
// src/lib/storage.ts
const SAVE_VERSION = 2
export function migrateProfile(raw: Partial<ProfileSave>): ProfileSave { /* fill defaults */ }
```
- Run `migrateProfile` on every entry in `loadProfiles()`.
- Bump `version` to 2; migration is idempotent and additive.
- This sprint adds **no** new fields yet — it just installs the migration mechanism and proves it round-trips existing saves unchanged.

### Tests
- Existing 133 tests must still pass unchanged (proves the refactor is behavior-preserving).
- New `storage.test.ts` cases: `migrateProfile` on a v1 save produces a valid v2 save; idempotent (running twice = running once); missing optional fields get defaults.
- Add a lightweight render smoke test per extracted screen if a component test runner is wired (otherwise rely on `build` + manual QA).

### Acceptance criteria
- [ ] `MathGame.tsx` < 300 lines; each screen is its own file.
- [ ] All 133 existing tests pass with zero changes to their assertions.
- [ ] `loadProfiles()` on a pre-existing save returns identical data (migration is a no-op for v1→v2 with no new fields).
- [ ] No visual or behavioral change for the user.

### Risk & mitigation
- **Regression risk is the whole risk of this sprint.** Mitigation: extract one screen at a time, build+test after each. Keep the diff mechanical — move code, don't rewrite it. Manual QA pass of every screen before merge.

---

## Sprint 2 — The Companion

**Why third:** Highest engagement-per-effort. Builds on Sprint 1's clean architecture. An evolving mascot makes the static theme feel alive.

### Data
`ProfileSave` additions (with migration defaults):
```ts
companionStage: number        // 0 egg · 1 baby · 2 adult · 3 legend   (default 0)
unlockedCompanions: string[]  // theme keys owned (default [themeKey])
```
`Theme` additions:
```ts
evolutionStages: [string, string, string, string]   // egg → legend
evolutionLabels: [string, string, string, string]
```

### Logic
- In `endSession` (now in `useGameState`): after a level is mastered, derive `companionStage` from `highestUnlockedLevel` (≥5 → 1, ≥10 → 2, >20 → 3) and unlock a new companion at levels 5/10/15/20 in a fixed order.
- Pure helper `computeCompanionProgress(profile)` → `{ stage, newlyUnlocked }` so it's unit-testable in isolation.

### UI
- **Mascot component** uses `evolutionStages[companionStage]` instead of `theme.mascot`.
- **Evolution moment:** full-screen overlay on stage-up — reuses `bounce-in` + `pulse-scale`. Reveals the new form with its label. This is the make-or-break delight moment; budget real animation time here.
- **Companion unlock toast:** reuse the existing achievement-toast pattern for newly unlocked companions.
- **Companions grid:** new section in AchievementsScreen (or a 4th identity in the existing tab) — 2×4 grid, earned glow / locked silhouette.

### Tests
- `computeCompanionProgress`: stage thresholds at exact boundaries; companions unlock in correct order at 5/10/15/20; idempotent (re-mastering a level doesn't double-unlock).
- Migration: a v2 save without companion fields gets `stage 0` / `[themeKey]`.

### Acceptance criteria
- [ ] Mascot visibly differs at levels 1, 5, 10, 20.
- [ ] Stage-up triggers a distinct, delightful full-screen moment.
- [ ] By level 20 the child owns all 7 companions; collection screen reflects it.
- [ ] Existing saves migrate cleanly and back-fill the active companion.

### Risk
- The evolution moment must feel special or the system reads as cheap. If emoji transitions feel flat, escalate to simple SVG/Lottie before shipping.

---

## Sprint 3 — The Homeland

**Why last:** Deepest retention mechanic, but highest engineering + content cost. Needs Sprint 1's architecture and gives the star counter a real purpose (a sink).

### Data
`ProfileSave` additions (with migration defaults):
```ts
spentStars: number     // default 0;  balance = totalStars - spentStars
world: PlacedItem[]    // default []
```
```ts
export interface PlacedItem { itemId: string; x: number; y: number }  // 6×6 grid
```
New static catalog:
```ts
// src/lib/catalog.ts
export interface CatalogItem {
  id: string; name: string; emoji: string
  price: number; themeKey: string; tier: 'common'|'uncommon'|'rare'
}
export const ITEM_CATALOG: CatalogItem[]   // ~10 items × 7 themes ≈ 70 items
```
Pricing: common 5–10⭐, uncommon 15–25⭐, rare 30–50⭐. A full 36-cell world ≈ 500–800⭐ (~2–3 weeks of daily play).

### Logic (in `useGameState`)
- `spendStars(amount)` → guarded; rejects if `balance < amount`.
- `placeItem(itemId, x, y)` → debits stars, appends to `world`. `removeItem(x, y)` (no refund, or partial — design choice).
- Selector `availableStars = totalStars - spentStars`.

### UI
- **My World screen:** 6×6 grid on `bg-slate-900`; placed items render as large emoji; tap empty cell → shop (filtered to active theme); tap placed item → remove.
- **Shop screen:** scrollable theme-filtered catalog; balance at top; price + buy-and-place; insufficient-funds items locked.
- **Home thumbnail:** ~100×100 preview of the world grid — the "I want to see my world" hook.
- **Bottom nav:** add 4th tab "🌍 World" (or theme emoji). Re-check spacing at 4 tabs.
- **Star display:** show `available / total` (e.g. "⭐ 23 / 150").

### Tests
- `spendStars` rejects overspend; balance math correct across earn/spend cycles.
- `placeItem`/`removeItem` maintain grid invariants (no two items same cell; coords in 0–5).
- Catalog integrity: unique ids; every `themeKey` valid; prices within tier bands.
- Migration: v2→v3 save back-fills `spentStars: 0`, `world: []`.

### Acceptance criteria
- [ ] Stars are spendable; balance never goes negative.
- [ ] Child can buy, place, and remove items; world persists across sessions.
- [ ] Each theme has a distinct item set; world thumbnail shows on home.
- [ ] Touch placement feels good on a phone (manual QA on a real device).

### Risk
- **Content depth:** ~70 items may be exhausted fast by an eager child. Plan a content cadence (new items monthly) before launch.
- **Touch UX:** 6×6 placement on small screens is finicky — prototype the interaction before committing to the full build.

---

## Cross-cutting concerns

**Migration chain.** v1 (today) → v2 (Sprint 1, mechanism only) → v2+companion (Sprint 2) → v3 (Sprint 3). Each step idempotent and additive. Single `migrateProfile` keeps a defaulted shape; bump `SAVE_VERSION` only when fields change.

**Testing posture.** Library logic stays pure and unit-tested (current strength — keep it). Component/UI verified by `build` + manual QA per sprint. Consider adding `@testing-library/react` in Sprint 1 if render tests become valuable.

**Definition of done (every sprint).** `npm run build` clean · `npm test` green · manual QA of touched screens · one PR, reviewed, squash-merged · existing-save compatibility verified.

**Sequencing is load-bearing.** Sprint 1 must land before 2 and 3. Building Companion or Homeland into the current monolith would roughly double their cost and produce hard-to-test code. Sprint 0 is independent and can ship anytime.
