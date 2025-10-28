# TypeScript `@ts-nocheck` Removal Roadmap

The first milestone removes `@ts-nocheck` from `ts-src/scripts/workbench.ts` and `ts-src/scripts/dustland-path.ts`. The build now succeeds with full type-checking on these files and the runtime tests still pass.

The remaining files with `@ts-nocheck` fall into three broad categories. The plan below sequences follow-up work so each step introduces the minimal set of new types and helpers.

## 1. Core engine infrastructure

**Scope**: `ts-src/scripts/dustland-core.ts`, the `core/` directory (combat, dialog, effects, inventory, item-generator, module-behaviors, movement, npc, quests, trader), and orchestration files such as `dustland-engine.ts`, `dustland-nano.ts`, `procedural-map.ts`, `multiplayer.ts`, and `adventure-kit.ts`.

**Notes**
- These files share hundreds of globals that are currently declared implicitly. Capturing the common surface in ambient definitions will unblock multiple files at once.
- Several modules (combat, inventory, movement) mutate shared state; typed helpers that wrap `globalThis` access will keep the implementation similar to the pattern established in `workbench.ts`.

**Suggested steps**
1. Extend `ts-src/global.d.ts` with structured interfaces for `player`, `NPCS`, `EventBus`, combat entities, and quest data so downstream code can reuse them.
2. Convert one subsystem at a time (for example `core/party.ts` → `core/movement.ts` → `dustland-core.ts`), replacing bare global reads with typed accessors. Start with files that already expose TypeScript types (party, inventory) to bootstrap the shared definitions.
3. Introduce lightweight utility modules (e.g., `src/types/globals.ts`) if repeated casting becomes noisy.
4. After each batch, run `npm test` to ensure the interaction-heavy suites stay green before moving to the next subsystem.

## 2. Module data bundles

**Scope**: `ts-src/modules/*.module.ts`.

**Notes**
- These files export large literal objects. Most errors stem from implicit `any` usage and reliance on `globalThis` helpers (`findItemIndex`, `removeFromInv`, `addToInv`).
- Creating module-specific type aliases (for encounters, NPC definitions, loot tables) will make the literals self-documenting.

**Suggested steps**
1. Add shared module schema types to `ts-src/modules/types.ts` (or extend the existing schema definitions) that describe rooms, NPCs, encounters, and dialog trees.
2. Replace the global helper lookups with the typed utilities introduced in the engine work, or inject them via function parameters when possible.
3. Remove `@ts-nocheck` one module at a time, starting with the smallest (e.g., `edge.module.ts`) to validate the schema before tackling larger story modules.

## 3. UI and tooling scripts

**Scope**: `ts-src/scripts/ui/skin-manager.ts`, `ts-src/scripts/workbench.ts` (already typed), `ts-src/music-demo.ts`, `ts-src/scripts/dustland-nano.ts`, and `ts-src/scripts/adventure-kit.ts`.

**Notes**
- These scripts interact with the DOM and browser APIs. Typing them mostly involves annotating the DOM elements and defining ambient types for third-party libraries (Tone.js, Magenta, Nano dialog helpers).
- `music-demo.ts` is self-contained but large; treat it as a separate effort once the engine globals are in place.

**Suggested steps**
1. Define DOM-centric utility types (e.g., `Nullable<T> = T | null`) and ambient declarations for external libraries in `global.d.ts` or dedicated `d.ts` files.
2. Convert `skin-manager.ts` next—it primarily manipulates style properties and should compile once the CSS variable map is typed.
3. Address `dustland-nano.ts` and `adventure-kit.ts` after the engine globals are formalized, since they depend on the same shared APIs.
4. Reserve `music-demo.ts` for last; split it into smaller helpers if needed to stay within manageable review size.

Following this sequence keeps each phase focused and maximizes reuse of newly introduced type definitions. The approach mirrors the conversions in `workbench.ts` and `dustland-path.ts`, so future migrations can lean on those patterns.
