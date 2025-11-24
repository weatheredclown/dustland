# TypeScript Code Health Review

## Overview
This report summarizes the current state of the Dustland TypeScript sources with a focus on typing quality, modular boundaries, and test reliability.

## Build and typing posture
* The TypeScript compiler runs with `strict` disabled and emits output even when errors occur (`noEmitOnError: false`). Combined with `skipLibCheck: true`, this configuration allows new code to bypass most static guarantees and can hide regressions until runtime.【F:tsconfig.json†L1-L20】
* Runtime files lean on pervasive `unknown` and `any`-style globals rather than typed modules. For example, the quest runtime casts `globalThis` to a broad `QuestRuntimeGlobals` shape and copies arbitrary metadata onto quest instances via `Object.assign`, leaving minimal compile-time protection for dialog, reward, or flag fields.【F:ts-src/scripts/core/quests.ts†L118-L199】

## Structure and maintainability
* Core engine scripts remain monolithic and execute side effects at module load. `dustland-engine.ts` immediately reads DOM nodes, rewires `console.warn`/`console.error`, and installs global event handlers inside an IIFE, which makes unit testing and incremental refactoring difficult because initialization interleaves UI wiring with business logic.【F:ts-src/scripts/dustland-engine.ts†L1-L160】
* Cloud and multiplayer boot logic inside `module-picker.ts` chains dynamic imports without a fallback strategy. When the environment lacks `importModuleDynamicallyCallback` (as in jsdom), these imports throw and produce repeated warning logs, complicating offline or test execution of the picker flow.【F:ts-src/scripts/module-picker.ts†L171-L247】

## Test and runtime signals
* The automated test suite currently fails six quest-related assertions (e.g., missing reward items and incorrect XP gating), indicating functional gaps around quest turn-in and choice handling that should be triaged before new quest features land.【a85f43†L1-L72】
* Multiple jsdom-driven UI tests report `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING` and network fetch errors when loading hosted fonts or Firebase bootstrap scripts. These issues stem from the dynamic import usage noted above and from unguarded external asset requests, which reduce determinism in headless environments.【a85f43†L73-L155】

## Recommendations
* Turn on incremental strictness (`noImplicitAny`, `noImplicitReturns`, or full `strict`) and enable `noEmitOnError` to stop shipping builds with type errors. Pair this with targeted type annotations for global runtime helpers to catch shape mismatches earlier.
* Decompose monolithic scripts by extracting pure utilities and view-model layers from DOM wiring blocks. This will make it easier to test combat, quest, and UI flows without instantiating the full page.
* Add guards and fallbacks around dynamic imports and external resources so jsdom and offline modes can stub or skip cloud features without hard failures. Consider dependency injection for server-mode adapters to improve isolation in tests.
* Investigate and fix the failing quest turn-in tests before expanding quest content, using the existing assertions as acceptance criteria for reward assignment and XP calculation.
