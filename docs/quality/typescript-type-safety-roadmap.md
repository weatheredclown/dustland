# Type Safety Roadmap

## Objectives
- Raise confidence in TypeScript builds so regressions are caught before deployment rather than during manual playtesting.
- Reduce reliance on implicit globals and `any` casts so IDE hints and refactors remain trustworthy.
- Make type expectations explicit at the boundaries between engine code, modules, and browser APIs.

## Milestones

### 1. Baseline tightening (short term)
- Enable `noImplicitAny`, `noUnusedLocals`, and `noUnusedParameters` in `tsconfig.json`, then address the highest-churn files first (event bus, renderer, HUD). Add temporary `tsconfig` overrides only where needed to keep the main config clean.
- Replace `globalThis` property casts in `ts-src/scripts/dustland-engine.ts` with well-scoped interfaces in `ts-src/types/` and reference them from initialization scripts.
- Wrap DOM lookups in typed helpers (e.g., `getCanvasOrThrow`, `getElementByIdChecked`) and migrate hot paths to those helpers to eliminate repeated non-null assertions.
- Establish a `typecheck` npm script that runs `tsc --noEmit` and add it to the default test pipeline to prevent unchecked errors from shipping.

### 2. Structural hardening (medium term)
- Convert IIFE-style globals (event bus, multiplayer helpers, AI utilities) into ES modules that export named functions and types. Where HTML entry points still need globals, expose a single typed shim rather than mutating `globalThis` in multiple files.
- Define shared domain models for multiplayer peers, quest state, and equipment helpers under `ts-src/types/`, replacing `unknown`/`any` payloads on the event bus with discriminated unions.
- Standardize renderer and HUD utilities so rendering functions accept typed props instead of loose objects. Use generics to type-safely thread state through event listeners and animation loops.
- Add ESLint with TypeScript rules that mirror the stricter compiler settings (no implicit `any`, `no-misused-promises`, import ordering, optional chaining/nullish coalescing).

### 3. Strict-by-default enforcement (long term)
- Flip `strict: true` once the above migrations land, eliminating config overrides and ensuring new code meets the bar.
- Gate merges on `npm test` plus the `typecheck` script in CI; fail builds on new `tsc` or ESLint violations.
- Measure progress with type coverage reports (e.g., `type-coverage` or `ts-prune`) and periodically clean unused exports and dead globals.

## Practices to sustain improvements
- Treat new features as opportunities to delete legacy globals; prefer dependency injection through constructors or module imports.
- Pair functional changes with type additions so migrations never fall behind feature work.
- Add focused tests for event-bus contracts, multiplayer normalization, and HUD rendering to lock in typed seams while strictness rises.
