# Design System — Kumon Math Adventure

## Product Context
- **What this is:** A Kumon-style math learning game that makes practice feel like play — 20 progressive levels from counting dots to algebra
- **Who it's for:** Children ages 4–16+ (multi-profile: multiple kids share one device), with parents setting up profiles
- **Space/industry:** Kids' edtech / gamified learning (peers: Duolingo, Prodigy, Khan Academy Kids)
- **Project type:** Mobile-first web app (touch-only number pad, localStorage, no backend)
- **Memorable thing:** "Math feels like a game" — the first impression is play, not homework

## Aesthetic Direction
- **Direction:** Midnight Clarity — dark arcade energy, clean typographic structure, soft movements.
- **Background:** `#0F172A` (slate-900) — dark navy, not void-black. Warm enough to feel inviting, dark enough to make the level arc colors glow.
- **Decoration level:** Intentional — clean dark surfaces. No heavy neon borders. Level colors appear as accent bars and subtle glows, not full-bleed fills.
- **Mood:** Confident, warm, game-like. Like Apple Arcade meets a kids' math app. The first impression is *real game*, not homework.
- **Animation:** Mascots float gently. Stat cards slide-up on enter. Level tiles stagger in. These are the "Soft Kingdom" movements that make it feel alive — not static, not frantic.
- **Design shotgun research basis:** Three directions explored (Midnight Arcade, Soft Kingdom, Sports Mode). Approved synthesis takes: dark atmosphere from A, clean lines from C, movements from B. Amber #FBBF24 as CTA was explicitly approved — it was the brand amber background, now flipped to work as a warm glow accent on dark.

## Typography — Nunito Variable (single font system)

**Why Nunito:** Fredoka is now the industry standard for kids' edu apps — it appears in Duolingo, Quizlet Kids, and countless others. Nunito is rounder, has a wider weight range (400–900 in one variable file), and handles body text + display + numbers from a single load. More distinctive than Fredoka in this market.

- **Hero / Level names / Big headings:** Nunito, weight 900
- **UI headings / Button labels:** Nunito, weight 800
- **Sub-labels / Secondary text:** Nunito, weight 700
- **Body / Narration / Story sentences:** Nunito, weight 500–600
- **Hints / Metadata:** Nunito, weight 400

- **Problem numbers in game:** Nunito weight 800, `font-variant-numeric: tabular-nums` — numbers must align vertically, feel bold and unambiguous at large sizes (72–80px on dark, numbers are the hero)
- **Timer display:** Nunito weight 700, `font-variant-numeric: tabular-nums`

**Loading:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

**CSS:**
```css
font-family: 'Nunito', system-ui, sans-serif;
```

**Scale:**
| Role | Size | Weight |
|---|---|---|
| App title / Hero | 30–40px | 900 |
| Level name / Section heading | 20–26px | 900 |
| Card heading | 16–18px | 800 |
| Problem numbers | 52–64px | 800 + tabular-nums |
| Button label | 16–20px | 800–900 |
| Body / narration | 14–16px | 500–600 |
| Metadata / badges | 11–13px | 700 |

## Color

**Approach:** Balanced — primary brand colors + semantic colors for hierarchy + a deliberate 20-level progression arc.

### Core Palette

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| `--background` | `#0F172A` | `bg-slate-900` | Global background — dark navy |
| `--surface` | `#1E293B` | `bg-slate-800` | Cards, panels, problem card |
| `--foreground` | `#F1F5F9` | `text-slate-100` | Primary text |
| `--muted` | `#64748B` | `text-slate-500` | Labels, metadata, hints |
| `--border` | `rgba(255,255,255,.07)` | `border-white/[0.07]` | Card borders |
| `--primary` | `#FBBF24` | `bg-amber-400` | Play! button, active chip, CTA (amber — warm on dark) |
| `--primary-dk` | `#F59E0B` | `bg-amber-500` | Hover state |
| `--correct` | `#22C55E` | `bg-green-500` | Correct feedback, Next Level button |
| `--wrong` | `#EF4444` | `bg-red-500` | Wrong feedback |
| `--star` | `#FBBF24` | `text-amber-400` | Stars, streak |

### 20-Level Color Arc

The levels progress from warm (easy, young) to cool (advanced, older). This is a deliberate brand decision — the child visually experiences themselves moving through a spectrum as they advance. No other kids' math app defines this intentionally.

| Level | Name | Color | Hex |
|---|---|---|---|
| 1 | Count to 5 | Orange | `#F97316` |
| 2 | Count to 10 | Orange-amber | `#FB923C` |
| 3 | Add to 5 | Amber | `#F59E0B` |
| 4 | Add to 10 | Yellow-amber | `#EAB308` |
| 5 | Add to 10 fast | Lime | `#84CC16` |
| 6 | Add to 20 | Green | `#22C55E` |
| 7 | Subtract from 5 | Emerald | `#10B981` |
| 8 | Subtract from 10 | Teal | `#14B8A6` |
| 9 | Subtract from 20 | Cyan | `#06B6D4` |
| 10 | Math Master | Sky | `#0EA5E9` |
| 11 | Multiply ×2,5,10 | Blue | `#3B82F6` |
| 12 | Multiply ×3&4 | Indigo | `#6366F1` |
| 13 | Times Tables | Violet | `#8B5CF6` |
| 14 | Division | Purple-violet | `#7C3AED` |
| 15 | Bigger Multiply | Purple | `#A855F7` |
| 16 | Long Division | Deep purple | `#9333EA` |
| 17 | Powers | Deeper violet | `#6D28D9` |
| 18 | Square Roots | Very deep violet | `#4C1D95` |
| 19 | Percentages | Dark indigo | `#3730A3` |
| 20 | Algebra | Royal blue | `#1D4ED8` |

## Spacing

- **Base unit:** 8px
- **Density:** Comfortable — this is a mobile game, not a dashboard

| Token | Value | Usage |
|---|---|---|
| 2xs | 2px | Icon nudges |
| xs | 4px | Tight gaps |
| sm | 8px | Internal chip/badge padding |
| md | 16px | Card internal horizontal padding |
| lg | 24px | Section gaps, card padding |
| xl | 32px | Between major sections |
| 2xl | 48px | Page sections |
| 3xl | 64px | Hero spacing |

## Layout

- **Approach:** Mobile-first single column (max-width: 375px content, centered)
- **Max content width:** 480px (keeps touch targets reachable on wider phones)
- **Touch targets:** Minimum 60px height for all interactive elements. Number pad keys: 60px height.

**Border radius scale:**

| Token | Value | Usage |
|---|---|---|
| `--r-sm` | 8px | Badges, tight chips |
| `--r-md` | 16px | Small cards, progress bar |
| `--r-lg` | 24px | Level cards, stat cards |
| `--r-xl` | 32px | Problem card, main action buttons |
| `--r-full` | 9999px | Profile chips, pill buttons, dots |

**Shadows:**

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06)` |
| `--shadow-lg` | `0 10px 30px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)` |

## Motion

- **Approach:** Expressive — this is a game. Feedback animations are the reward. Keep all existing animations.
- **Easing:** Enter: ease-out. Exit: ease-in. State change: ease-in-out.

| Duration | Value | Usage |
|---|---|---|
| Micro | 50–100ms | Button press scale |
| Short | 150–250ms | State transitions, feedback flash |
| Medium | 250–400ms | Card entrance, mascot mood change |
| Long | 400–700ms | Confetti burst, level complete |

**Existing animations to keep (all correct):**
- `bounce-in` — correct answer feedback, achievement toast
- `confetti-fall` — session mastery
- `float-star` — per-correct-answer reward
- `pulse-scale` — streak/star numbers
- `shake` — wrong answer on problem card (use sparingly)
- `wiggle` — mascot idle state

**Tighten number pad press:** `transform: scale(0.88)` on `:active` (currently 0.92 — make it more physical/game-like)

**Add: stagger-in for level cards** on level select screen (each card fades+slides up with 40ms delay between them, total duration 200ms — makes the map feel alive on open).

## Phase 2 Consideration (not implemented)

An independent design voice noted: *"A 14-year-old doing pre-algebra will not use an app that looks identical to the one a 4-year-old uses for counting dots."* Progressive dark backgrounds for levels 11–20 (when users are older) is worth exploring — the UI could grow up with the child. This requires rethinking every screen for dark mode and is deferred to a future sprint.

## Implementation Notes

1. **Replace Comic Sans in `globals.css`:** Change `font-family: 'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', sans-serif` to `font-family: 'Nunito', system-ui, sans-serif` after adding the Google Fonts link to `layout.tsx`
2. **Update level colors in `curriculum.ts`:** Replace all 20 `color:` fields with the arc values above
3. **Tailwind custom colors:** The `kid-*` colors can remain as aliases for the semantic colors; the primary accent changes to the indigo family
4. **Number pad `:active`:** Change `scale(0.92)` to `scale(0.88)` in `globals.css`

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-27 | Initial design system created via /design-consultation | Based on competitive research (Prodigy, Duolingo, Khan Academy Kids, Mathletics) + product context |
| 2026-05-27 | Nunito chosen over Fredoka | Fredoka is now the industry standard in kids' edu apps — Nunito is more distinctive, wider weight range, single variable file |
| 2026-05-27 | Amber background (#FFFBEB) kept as brand identity | Every competitor uses white. The amber background is already the app's most distinctive visual feature. |
| 2026-05-27 | 20-level warm→cool color arc defined | Replaces random per-level colors with a deliberate progression. No other kids' math app has done this. |
| 2026-05-27 | Indigo (#4F46E5) as primary interactive accent | Distinctive from the level colors, authoritative enough for "Play!" CTA, not the generic purple that other apps use |
| 2026-05-27 | Progressive dark mode deferred to Phase 2 | Age-appropriate dark UI for advanced levels is a strong concept but requires full dark mode implementation |
