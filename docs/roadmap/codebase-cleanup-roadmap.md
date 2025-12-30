# Codebase Cleanup and Restructuring Roadmap

*By Priya "Gizmo" Sharma*
> **Priority:** 4 – Make the code shippable and malleable without slowing down feature crews.

Our goal is to make Dustland easier to reason about, safer to extend, and cheaper to test. This roadmap breaks the refactor into steady, reversible steps that keep the playable experience intact while we rewire the guts.

## Guiding principles
- Preserve the browser-friendly flow: emit build artifacts from `ts-src/` back into `components/`, `modules/`, and `scripts/` so HTML entry points keep working.
- Prefer typed helpers, small functions, and explicit boundaries over ad hoc globals and `@ts-nocheck` patches.
- Keep module data edits flowing through the CLI in `scripts/module-tools` so content stays valid and diffable.
- Ship small slices: each phase should leave the branch playable and reduce blast radius for rollback.

## Phase 1 – Baseline and inventory
- [ ] Add a dependency audit and duplicate-package scan to `npm test` to catch drift before upgrades land.
- [ ] Generate a source-to-artifact freshness report (TypeScript ↔ emitted JS) and fail `npm run check:prod` when files go stale.
- [ ] Catalogue all `@ts-nocheck` headers, temporary globals, and inline DOM shims; tag each with an owner and removal plan.
- [ ] Establish a repo map covering `ts-src/components`, `ts-src/modules`, `ts-src/scripts`, and shared `types/` so new contributors can find surfaces quickly.

## Phase 2 – Boundaries and layering
- [ ] Carve out an engine core (render loop, event bus, combat/movement primitives) separate from module content and UI chrome.
- [ ] Introduce feature module boundaries: define what can import from `modules/`, `components/`, and shared helpers, and enforce via lint rules or a lightweight import graph check.
- [ ] Create adapter seams for browser-only APIs (audio, WebGL, storage) to simplify unit tests and future node-based tooling.
- [ ] Consolidate configuration loading into a single path with typed defaults to remove scattered `??` fallbacks.

## Phase 3 – Data and content hygiene
- [ ] Expand the module CLI to validate placement, dialog trees, and quest triggers in one pass; gate merges on the checks.
- [ ] Normalize JSON schemas for NPCs, items, zones, and dialog; auto-generate TypeScript types and editor stubs from the schemas.
- [ ] Add migration scripts for legacy module data and ship replayable fixtures that cover combat arenas, merchants, and bunkers.
- [ ] Replace file-system fetches with embedded JS exports to keep offline play working from `file:` URLs.

## Phase 4 – UI and input rework
- [ ] Extract a minimal UI kit (buttons, overlays, HUD panels) so styles and hit boxes remain consistent across HTML entry points.
- [ ] Centralize input routing (keyboard, touch, gamepad) with debounced handlers and per-screen bindings instead of scattered listeners.
- [ ] Add accessibility passes to dialog, inventory, and trainer screens (focus order, aria labels, readable contrast).
- [ ] Build a storybook-style gallery for UI snippets using the existing HTML shells for rapid manual testing.

## Phase 5 – Observability and safety nets
- [ ] Wire smoke tests that boot `dustland.html`, `game.html`, and `adventure-kit.html` and assert UI-ready states.
- [ ] Add golden-path combat and traversal scripts runnable via `npm test` to catch regressions in movement queues and combat HUD updates.
- [ ] Integrate lightweight telemetry hooks (event counts, timing buckets) behind a stubbed interface so they can be toggled in builds.
- [ ] Document rollback procedures per phase, including which assets and modules need resync after revert.

## Phase 6 – Release guardrails and ownership
- [ ] Fold `npm run check:prod`, HTML presubmit checks, and module placement scans into CI before merges, with nightly runs for drift.
- [ ] Publish a maintainer roster for engine core, module data, and UI kit; make them sign off on cross-cutting refactors.
- [ ] Track migration progress in `docs/roadmap/prioritized-backlog.md` with weekly status, blocking issues, and next steps.
- [ ] Close the effort with a retro and doc pass: prune deprecated helpers, backfill README sections, and codify the new boundaries.
