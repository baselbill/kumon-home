# Kumon Methodology Analysis & Application to kumon-home

## Part 1: Core Learnings from Kumon Physical Worksheets

### The Kumon System Overview

Kumon is fundamentally built on **mastery through intentional repetition**, not breadth. The physical worksheets analyzed reveal four interlocking design principles:

#### 1. **Hierarchical Progression by Micro-Steps**
- **Structure**: Topics unfold in sequence (D29→D34 for 2×2, D41→D46 for 3×2, etc.)
- **Pace**: Each topic spans 5–10 worksheets before advancing to the next skill
- **Why it works**: A single skill is practiced across multiple exposures, building fluency before complexity layers on

#### 2. **Controlled Variation Within Repetition**
- **Pattern**: Fixed first operand (e.g., 25 × [17, 28, 39...], then 26 × [16, 27...])
- **Benefit**: The student practices the same mental operation repeatedly, changing only one variable at a time
- **Cognitive load**: Learner can focus on **how to multiply 25** without simultaneously worrying about a new number size
- **Why it works**: Reduces cognitive noise; builds procedural fluency through predictable patterns

#### 3. **Self-Paced Advancement via Performance Gates**
- **Mechanism**: Four groups (A, B, C, D) based on error count thresholds
  - Group A: 90% accuracy, 1–2 errors allowed → move to next sheet
  - Group B: 70% accuracy, 3–6 errors allowed → stay or move slowly
  - Group C: 50% accuracy, 7–10 errors allowed → significant remediation signal
  - Group D: <50% accuracy → deep review needed
- **Why it works**: Every child progresses at their own pace; no artificial "grade level" forcing readiness gaps

#### 4. **Immediate Feedback & Visible Mastery**
- **Feedback**: Answers printed on the sheet; child self-grades instantly
- **Persistence**: Header shows Date + Time, creating a dated record of progress
- **Motivation driver**: A stack of completed sheets is concrete, visible evidence of mastery
- **Why it works**: Intrinsic feedback loop (vs. waiting for teacher feedback) keeps motivation high

---

### Secondary Design Insights

**Predictable structure builds confidence.**
- Every sheet is 20 problems: students know what to expect.
- Header is always in the same position: reduces cognitive friction.
- Problem numbering (1)–(20) is identical across all worksheets.

**Mastery != speed.**
- The system measures *accuracy*, not completion time.
- A child who takes 10 minutes but gets all 20 correct is more advanced than one who races through with 8 errors.

**Companions are secondary to the core loop.**
- Aesthetic theming (e.g., "Multiplication und Division 2") exists, but the real engagement is mastery.
- Progress is the primary motivator, not cosmetics.

---

## Part 2: Assessment of kumon-home Architecture

### Current System Design

The app has a **progress-and-reward structure**:

```
Profile Data:
- highestUnlockedLevel (1–20)
- totalStars (earned per level mastered)
- sessionStarts / sessionEnds (timing tracked)

Reward Layers:
- Level advancement (primary motivation)
- Star accumulation (economy token)
- Mascot evolution (visual feedback at milestones: 0→1 at L5, 1→2 at L10, 2→3 at L20)
- World building (consume stars to place items in a 6×6 grid)
- Companion collection (unlock new mascots at specific thresholds)
- Achievements (badges for secondary goals)
```

### Alignment with Kumon Principles

**Strong alignment (where the app matches Kumon):**
1. ✅ **Self-paced**: Each profile progresses independently; no forced grade-level constraints.
2. ✅ **Micro-progression**: 20 levels of increasing difficulty mirrors Kumon's incremental difficulty curve.
3. ✅ **Immediate feedback**: The app shows correct/incorrect instantly; no wait for feedback.
4. ✅ **Visible mastery**: The progress bar (20-dot strip) and level numbers make advancement concrete.
5. ✅ **Performance-gated advancement**: To unlock level N+1, level N must be mastered (presumably at a threshold like 70%+).

**Gaps from Kumon (opportunities for deepening):**
1. ❌ **No controlled variation within repetition** — the app presents new problems each session, not the "same operation, tweak one variable" pattern. This sacrifices procedural fluency for breadth.
2. ❌ **No explicit accuracy tier system** — the app doesn't segregate users into Groups A/B/C/D; all paths treat 70% as "pass." Kumon's granular tiers allow finer remediation.
3. ❌ **Weak feedback signal** — the app shows correct/incorrect but doesn't track or surface *error patterns*. Kumon's error-count ceiling forces students to diagnose and fix systematic mistakes.
4. ❌ **Cosmetics dominate motivation** — the star economy and world-building are designed to be the primary engagement drivers, potentially overshadowing the core skill-building loop.

---

## Part 3: Applying Kumon to kumon-home

### A. Adopt Controlled Variation (High Impact, Medium Effort)

**Idea**: Instead of randomizing all 20 problems within a level, structure them as:
- **Problems 1–4**: Same operation base, first operand fixed
- **Problems 5–8**: Advance by one digit, keep the pattern
- **Problems 9–12**: Reverse or swap operands (still the same skill, different visual order)
- **Problems 13–16**: Introduce a new skill component (e.g., regrouping in multiplication)
- **Problems 17–20**: Unseen combinations (true test of fluency)

**Example** (Level 5 — multiplying 2-digit by 1-digit):
```
(1) 25 × 3 = ?    (5) 26 × 3 = ?    (9) 3 × 25 = ?    (13) 35 × 3 = ?    (17) 47 × 6 = ?
(2) 25 × 4 = ?    (6) 26 × 4 = ?    (10) 4 × 26 = ?   (14) 35 × 4 = ?    (18) 52 × 7 = ?
(3) 25 × 5 = ?    (7) 26 × 5 = ?    (11) 5 × 25 = ?   (15) 35 × 5 = ?    (19) 48 × 8 = ?
(4) 25 × 6 = ?    (8) 26 × 6 = ?    (12) 6 × 26 = ?   (16) 35 × 6 = ?    (20) 63 × 9 = ?
```

**Why**:
- Cuts cognitive load; learner focuses on *how to multiply 25* in the first block.
- Procedural fluency emerges naturally; by block 4, the student can *generalize*.
- Blocks 17–20 validate transfer; if a child struggles there, it's a mastery signal.

**Implementation effort**: Refactor `problems.ts` (problem generation) to accept a `structure: 'classic-random' | 'kumon-structured'` parameter. Start with structured for new levels, keep random as an option for legacy/variety.

---

### B. Introduce Performance Tiers (High Impact, High Effort)

**Idea**: After a session, classify the profile into one of 4 tiers based on accuracy:
```ts
type PerformanceTier = 'mastery' | 'proficient' | 'developing' | 'emerging'

// Scoring
if (accuracy >= 90%) → 'mastery'         // errors 0–2
else if (accuracy >= 70%) → 'proficient' // errors 3–6
else if (accuracy >= 50%) → 'developing' // errors 7–10
else → 'emerging'                        // errors 11+

profile.currentTier = tier
profile.tierHistory = [...tierHistory, { level, date, tier, accuracy, errorCount }]
```

**Implications**:
- A child at 'mastery' tier unlocks the next level immediately.
- A child at 'proficient' tier stays on the current level for 1–2 more sessions (optional in-app suggestion: "Practice once more to reach mastery").
- A child at 'developing' tier repeats 2–3 times; the app can optionally offer a "rematch on easier problems" variant.
- A child at 'emerging' tier triggers a review: app backtracks to the previous level.

**UI surface**:
- Show tier badge on session-complete screen ("🎯 Mastery", "✅ Proficient", "📈 Developing", "💪 Emerging").
- In the level details view, show a mini-chart of tier history for that level (was the child improving each session?).
- On the home screen, suggest next action based on tier ("Ready to advance!" vs. "One more practice to unlock?").

**Why**:
- Mirrors Kumon's error-threshold system.
- Provides a clear, non-punitive signal for remediation.
- Allows the app to guide (not force) pacing, respecting individual readiness.

**Implementation effort**: High. Requires:
- New data model in `ProfileSave` (tier tracking).
- Migration in `storage.ts` to backfill tier history for existing profiles.
- New logic in `useGameState` to compute tier and handle tier-based advancement rules.
- UI changes in `SessionCompleteScreen`, `LevelSelectScreen`, home tier badges.

---

### C. Surface Error Patterns (Medium Impact, Medium Effort)

**Idea**: Track *which problems* within a level cause errors, across sessions.

```ts
// New data shape
interface ProblemError {
  levelId: number
  problemIndex: number
  operands: [number, number]
  userAnswer: number
  correctAnswer: number
  date: ISO string
}

profile.errorLog = [...errorLog, newError]
```

**Report generation**:
```ts
function describeErrorPattern(levelId: number, profile: Profile) {
  const errors = profile.errorLog.filter(e => e.levelId === levelId)
  
  // Detect patterns
  if (errors.length > 0 && errors.every(e => e.userAnswer > e.correctAnswer))
    return "You're adding too much. Check your regrouping."
  
  if (errors.cluster_around_operand(25)) // e.g., 25×4, 25×5, 25×6
    return "The number 25 is tricky for you. Let's practice it more."
  
  return "Random errors — keep practicing!"
}
```

**UI surface**:
- After a session with errors, show a brief diagnostic on `SessionCompleteScreen`:
  - "You struggled with regrouping in [specific problems]. Want a focused remix?"
  - Or: "You nailed it all except 25 × 7. Want to drill that?"
- Optional: A "My Trouble Spots" section in `AchievementsScreen` showing top-3 problem types to revisit.

**Why**:
- Kumon's error ceiling (1–2 errors = pass) forces the student to notice *their* mistake, not the system's.
- Digital can do even better: surface the *pattern* so the student learns *why* they're failing.
- Diagnostic feedback is more motivating than random "try again."

**Implementation effort**: Medium. Mostly data plumbing; UI is simple error cards.

---

### D. Refactor Reward Economics (Medium Effort, Lower Priority)

**Current design**: Stars are earned at level completion; spent on world items. This decouples effort (learning) from reward (cosmetics).

**Kumon design principle**: Mastery is the primary reward. Cosmetics reinforce it, but don't replace it.

**Recommendation**: Make stars secondary to *tier progression*. For example:
- Unlock next level based on tier (not arbitrary % threshold).
- Award stars for *consistency* (e.g., "3 sessions in a row at 'mastery' tier" = bonus 5 stars).
- Tie world-building to level milestones, not just star balance (e.g., "At level 5, unlock garden; at level 10, unlock cabin").

**Why**: This keeps the focus on skill-building and reframes cosmetics as *evidence of progress*, not *the goal*.

---

## Part 4: Implementation Roadmap

### Phase 1 (Immediate, 1–2 sprints)
1. **Structured problem generation** (A)
   - Refactor `problems.ts` to support block-based sequencing.
   - Create test cases for Kumon-style structure.
   - Rollout to new levels first; keep random for legacy.

2. **Performance tiers** (B, core logic only)
   - Add tier computation to `useGameState.ts`.
   - Store tier + tierHistory in `ProfileSave`.
   - Add migration in `storage.ts`.

### Phase 2 (2–3 sprints)
3. **Tier UI** (B, surface)
   - Show tier badge on `SessionCompleteScreen`.
   - Add tier suggestion logic for next session.
   - Add tier chart to `LevelSelectScreen`.

4. **Error diagnostics** (C)
   - Log errors to `profile.errorLog`.
   - Implement basic pattern detection.
   - Show diagnostic on `SessionCompleteScreen`.

### Phase 3 (Polish & data-driven iteration)
5. **Reward refactor** (D)
   - Tie star economy to tier streaks, not just completion.
   - Make world unlock conditional on level milestone, not star count.

---

## Part 5: Design Principles Going Forward

### Hierarchy of Motivation (in order)

1. **Mastery** — The core loop: solve problems, improve accuracy, unlock next level.
2. **Clarity** — Tier badges, error diagnostics, and progress charts show *why* you're advancing.
3. **Autonomy** — Tiers guide but don't force; learner controls re-attempt frequency.
4. **Cosmetics** — Mascots and world build on mastery, not replace it.

### Metrics to Track

- **Tier progression**: Is the child hitting mastery tier more often over time?
- **Error pattern resolution**: Does a child who focuses on a trouble spot improve?
- **Pacing**: Are tiers correlated with healthy (not too fast, not too slow) level advancement?
- **Retention**: Does tier clarity + cosmetic reward combination improve week-over-week engagement?

### Content Depth (Kumon insight)

Kumon's worksheets repeat the same skill 5–10 times before moving on. In a digital product:
- If a child masters a level in 1 session, they can unlock the next immediately.
- But they *can* re-attempt a level to achieve a higher tier (mastery vs. proficient).
- Make re-attempt low-friction and socially rewarded ("You earned a mastery badge! 🎯").

---

## Summary

The Kumon methodology is a masterclass in **friction-free skill building**. Its success rests on:
1. Repeating the same operation with controlled variation.
2. Precise feedback (error counts) that signals readiness without shame.
3. Visible progress that makes mastery tangible.

**kumon-home is already aligned on self-pacing and feedback.** The gaps are:
- Structured problem sequencing (controlled variation).
- Tier-based advancement (error thresholds).
- Transparent error diagnostics.

Implementing these three will move the app from *"a game about math"* to *"a Kumon-inspired system for building real fluency."*
