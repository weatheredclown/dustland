# Tech Debt Burn Down Plan

*By Priya "Gizmo" Sharma*
> **Priority:** 3 – Debt cleanup unlocks future work.

Our CRT playground is scrappy by design, but a few lingering habits slow our builds and snarl debugging. This doc maps out the debt we can pay down without breaking our "just open the file" mantra.

## Pain Points

- **Global sprawl.** Most modules dump functions and state into `globalThis`, making load order fragile and tests noisy.
- **Logic tied to UI.** Core movement calls DOM helpers directly, so basic pathing can't run without a browser.
- **Scattered state.** `player`, `party`, `state`, and other globals mutate from all directions with no single source of truth. Trying to treat `player.health` as a singleton also breaks once multiple party members enter play.

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
- Create a `GameState` singleton that owns the party roster, world state, shared inventory, and global flags.
- Keep per-member stats like health or stamina on the party members themselves.
- Track cross-cutting systems such as the world clock, difficulty mode, and active quests inside `GameState`.
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

- [x] **Phase 1: Namespace the world**
  - [x] Introduce `globalThis.Dustland = {}`.
  - [x] Move module exports into `Dustland.*` buckets.
    - [x] Namespace event bus under `Dustland.eventBus`.
    - [x] Namespace event flag helpers under `Dustland.eventFlags`.
    - [x] Namespace path helpers under `Dustland.path`.
    - [x] Namespace movement helpers under `Dustland.movement`.
    - [x] Namespace inventory helpers under `Dustland.inventory`.
  - [x] Namespace effects under `Dustland.effects`.
    - [x] Namespace actions under `Dustland.actions`.
  - [x] Update references and tests incrementally.
- [x] **Phase 1.5: Reorganize the filesystem**
  - [x] move core and JS files in root under a new scripts directory
- [x] **Phase 2: Untangle UI from logic**
  - [x] Replace direct DOM calls with event emissions.
  - [x] Build a tiny `ui.js` to listen for events.
  - [x] Keep old globals as shims during migration.
- [x] **Phase 3: Consolidate state**
  - [x] Create a `GameState` singleton.
  - [x] Provide accessors for state changes.
- [x] **Phase 4: Lint for sanity**
  - [x] Add ESLint with a vanilla config.
  - [x] Expose `npm run lint`.
  - [x] Run lint in CI and before commits.
  - [x] reorganize
