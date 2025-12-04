# TypeScript Quality Assessment

## Current state
- **Lenient compiler configuration.** The project disables `strict` mode and allows builds to proceed on type errors while skipping library checks, which reduces static-safety coverage and makes it easy for regressions to slip in during refactors. 【F:tsconfig.json†L3-L15】
- **Global namespace coupling.** Runtime utilities (for example, the event bus) register themselves via IIFEs onto `globalThis`/`Dustland`, which makes dependencies implicit, complicates test isolation, and hides initialization ordering problems. 【F:ts-src/scripts/event-bus.ts†L20-L51】
- **Heavy reliance on loosely typed globals.** Core engine code exposes numerous `unknown`-typed hooks and optional fields on `globalThis`, which weakens type inference for consumers and encourages unchecked casts. 【F:ts-src/scripts/dustland-engine.ts†L5-L33】

## Recommended steps to raise quality
1. **Tighten compiler settings incrementally.** Start by enabling `noImplicitAny`, `noUnusedLocals`, and `noUnusedParameters`, then move toward `strict: true` once the worst offenders are addressed. Pair each change with short-lived `tsconfig` overlays for specific scripts if migration must happen in phases.
2. **Establish explicit module boundaries.** Convert global IIFEs into exported modules and import them where needed. When globals are required for HTML entry points, expose a typed shim in one place rather than having each script mutate `globalThis`.
3. **Replace `unknown`/`any` globals with domain models.** Define interfaces for multiplayer peers, equipment helpers, quest state, and other shared helpers in `ts-src/types/`, and update consumers to rely on those types instead of unstructured `unknown` access. This reduces defensive casting and improves editor diagnostics. 【F:ts-src/scripts/dustland-engine.ts†L11-L33】
4. **Harden DOM interaction helpers.** Wrap raw `document.getElementById` calls in utilities that return narrowed element types or throw clear errors when required elements are missing, then adopt those helpers across renderer and HUD modules.
5. **Add linting for consistency.** Introduce an ESLint config that enforces import order, forbids implicit `any`, flags unused symbols, and prefers optional chaining/nullish coalescing—aligning lint rules with the compiler tightening roadmap.
6. **Strengthen test coverage for typed seams.** Add unit tests around event-bus contracts, multiplayer presence normalization, and HUD rendering to catch regressions as types become stricter; use typed test helpers to validate payload shapes rather than loose fixtures.
