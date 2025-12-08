# Type Safety Roadmap

This document outlines the strategy for improving type safety and TypeScript practices in the Dustland codebase.

## Current State
- **Configuration:** `strict: false` in `tsconfig.json`.
- **Type Definitions:** Extensive use of `any` and `unknown`.
- **Global Scope:** Heavy reliance on global variables (`player`, `party`, `Dustland` namespace) defined in multiple `.d.ts` files, leading to duplication and loose typing.
- **Artifacts:** Source code is in `ts-src/`, but build artifacts (`scripts/`, `modules/`) are checked in.

## Goals
1.  **Eliminate Duplicate Declarations:** Consolidate global type definitions into a single source of truth.
2.  **Reduce `any` Usage:** Replace `any` with specific types for core entities (`GameItem`, `DustlandNpc`, `Quest`).
3.  **Strict Mode:** Eventually enable `strict: true` in `tsconfig.json`.
4.  **Modularization:** Reduce reliance on global state by favoring imports and dependency injection where feasible.

## Phases

### Phase 1: Foundation & Cleanup (Immediate)
- **Consolidate Globals:** Merge `ts-src/types/dustland-globals.d.ts` and `ts-src/types/core-globals.d.ts` into `ts-src/global.d.ts`.
- **Remove Redundancy:** Delete redundant definition files.
- **Fix "implicitly has an 'any' type":** Address simple `noImplicitAny` errors in smaller files.

### Phase 2: Core Entity Typing
- **`GameItem` & `PartyItem`:** strict typing for item properties, mods, and usage effects.
- **`DustlandNpc`:** comprehensive typing for NPC behavior, dialog trees, and combat stats.
- **`Quest`:** precise types for quest stages, rewards, and requirements.
- **`DustlandNamespace`:** Ensure the `Dustland` global object is fully typed.

### Phase 3: Engine Refactoring
- **`dustland-engine.ts`:**
    - Isolate rendering logic from game state logic.
    - Create dedicated types for the HUD and UI layers.
- **`adventure-kit.ts`:**
    - Type the editor state and tool interactions.
    - strict schema for Module JSON data validation.

### Phase 4: Strict Mode Adoption
- Enable `noImplicitAny` globally or per-file.
- Enable `strictNullChecks` to catch potential runtime crashes.
- Use `unknown` instead of `any` for external data (like JSON imports) to force validation.

## Best Practices
- **Prefer Interfaces:** Use `interface` for public APIs and data structures.
- **Avoid `any`:** Use `unknown` if the type is truly dynamic, or a union type if known.
- **JSDoc to Types:** Convert existing JSDoc comments into TypeScript types.
- **Verification:** Run `npm run build` frequently to catch regressions.
