# CHANGELOG
## [0.1.0.0] - 2026-05-30

### Added
- **Concept-intro lessons** for new-operation curriculum transitions
  - "Learn it again" button on session-complete screen for struggling learners
  - Step-by-step carousel (Back/Next navigation) with visual learner support
  - Themed equal-groups visual for multiplication bridge (3 groups of 4)
  - Synthetic problem visuals reusing DotsDisplay for addition/subtraction intros
  - Full Kumon-aligned concept launch for all 8 new-operation levels:
    - Level 4 (addition): putting together + counting all
    - Level 8 (subtraction): taking away + how many left
    - Level 12 (multiplication): equal groups → repeated addition → × notation (flagship)
    - Level 15 (division): sharing equally + inverse of multiplication
    - Level 18 (powers): repeated multiplying + compact notation
    - Level 19 (square roots): inverse of squaring
    - Level 20 (percentages): percent as fraction of 100
    - Level 21 (algebra): variables as mystery numbers
  - Theme-aware copy (plural nouns, dotEmoji) so lessons match child's chosen world
  - Reusable `LessonIntroScreen` component with progress dots, ARIA accessibility
  - `seenIntros` profile field to track viewed lessons and skip replay

### Changed
- Routing: all four session entry points now go through `beginLevel()` for consistent intro handling
- `SessionCompleteScreen` now conditionally shows "Learn it again" when a lesson exists and session wasn't mastered
- Storage: `ProfileSave` includes new `seenIntros: number[]` field (defaults to `[]` for old saves)
- `MathGame.tsx` wiring: added `pendingLevelId` state and `reviewLesson()` callback for re-opening intros

### Technical
- New file: `src/lib/lessons.ts` (254 lines) — lesson content builders for 8 introducer levels
- New file: `src/components/shared/LessonVisual.tsx` (84 lines) — visual renderer (groups, synthetic problems, expressions)
- New file: `src/components/screens/LessonIntroScreen.tsx` (125 lines) — main intro carousel component
- New tests: `src/lib/__tests__/lessons.test.ts` (90 lines) — 16 test cases covering all 8 levels, theme integration, storage migration
- Design fixes: Mascot mood + button layout + font sizing + expression weight + ARIA labels + emoji removal

### Test Coverage
- All 8 new-operation levels verified for lesson existence and content structure
- Theme-aware copy tested across all preset themes
- Storage migration tested for backward compatibility
- 199 tests pass (9 test files, no failures)

