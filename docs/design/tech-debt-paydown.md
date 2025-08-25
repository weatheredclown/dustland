# Tech Debt Burn Down Plan

*By Priya "Gizmo" Sharma*

Our CRT playground is scrappy by design, but a few lingering habits slow our builds and snarl debugging. This doc maps out the debt we can pay down without breaking our "just open the file" mantra.

## Pain Points

- **Global sprawl.** Most modules dump functions and state into `globalThis`, making load order fragile and tests noisy.
- **Logic tied to UI.** Core movement calls DOM helpers directly, so basic pathing can't run without a browser.
- **Scattered state.** `player`, `party`, `state`, and other globals mutate from all directions with no single source of truth.

## Objectives

1. Corral globals under a single `Dustland` namespace to clarify ownership and cut collisions.
2. Route gameplay events through the existing `EventBus` so UI and logic can evolve separately.
3. Centralize game data in a `GameState` module with helpers for safe reads/writes.
4. Add a lightweight `npm run lint` script to catch common mistakes early.

## Phased Plan

### 1. Namespace the world
- Introduce `globalThis.Dustland = {}`.
- Move module exports into `Dustland.*` buckets (`Dustland.movement`, `Dustland.items`, etc.).
- Update references and tests incrementally.

### 2. Untangle UI from logic
- Replace direct DOM calls with event emissions (`EventBus.emit('hud:update')`).
- Build a tiny `ui.js` to listen for those events in the browser.
- Keep the old globals as shims during migration.

### 3. Consolidate state
- Create a `GameState` singleton that owns `player`, `party`, `world`, and flags.
- Provide accessors (`getState()`, `updateState(fn)`) so changes are explicit and observable.

### 4. Lint for sanity
- Drop in ESLint with a vanilla config and expose `npm run lint`.
- Run lint in CI and before commits to keep scripts clean.

## Risks & Mitigations
- **Breakage from renaming globals.** Ship migration in small slices and mirror old names until tests pass.
- **Event misuse.** Document new events and keep payloads simple.

## Success Criteria
- Tests run without stubbing dozens of globals.
- Moving logic files no longer requires hunting for hidden DOM hooks.
- A single `GameState` object mirrors what the player sees on screen.

## Tasks

- [ ] **Phase 1: Namespace the world**
  - [ ] Introduce `globalThis.Dustland = {}`.
  - [ ] Move module exports into `Dustland.*` buckets.
  - [ ] Update references and tests incrementally.
- [ ] **Phase 2: Untangle UI from logic**
  - [ ] Replace direct DOM calls with event emissions.
  - [ ] Build a tiny `ui.js` to listen for events.
  - [ ] Keep old globals as shims during migration.
- [ ] **Phase 3: Consolidate state**
  - [ ] Create a `GameState` singleton.
  - [ ] Provide accessors for state changes.
- [ ] **Phase 4: Lint for sanity**
  - [ ] Add ESLint with a vanilla config.
  - [ ] Expose `npm run lint`.
  - [ ] Run lint in CI and before commits.
