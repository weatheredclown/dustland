# Roadmap: Removing `@ts-nocheck` from `adventure-kit.ts`

**Goal:** Enable TypeScript checking for `ts-src/scripts/adventure-kit.ts` by resolving all 200+ errors identified during analysis.

The file `adventure-kit.ts` serves as the logic for the "Adventure Construction Kit" (ACK) editor. It relies heavily on global variables populated by other scripts (`dustland-core.ts`, `dustland-engine.ts`, etc.) and direct DOM manipulation.

## Current State
*   **File:** `ts-src/scripts/adventure-kit.ts` (6600+ lines)
*   **Directives:** `// @ts-nocheck` at the top and bottom.
*   **Error Count:** ~214 errors (mostly missing globals and implicit any).

## Phase 1: Global Type Definitions
The majority of errors stem from TypeScript not knowing about global functions and variables that are available at runtime. These must be declared in `ts-src/global.d.ts` or `ts-src/types/dustland-globals.d.ts`.

**Missing Globals identified:**
*   `nextLoopPoint` (defined in `loop.ts` IIFE, attached to globalThis)
*   `showEditorTab` (defined in `adventure-kit.ts` IIFE, attached to globalThis)
*   `makeInteriorRoom` (from `dustland-core.ts`)
*   `placeHut` (from `dustland-core.ts`)
*   `gridFromEmoji` / `gridToEmoji`
*   `interiors`, `buildings`, `world`, `portals`, `tileEvents` (global collections from `dustland-core.ts`)
*   `applyInteriorBrush` (defined in `adventure-kit.ts` global scope but flagged in some contexts)

**Action:** Update `ts-src/types/dustland-globals.d.ts` (or `global.d.ts`) to extend the `Window` and `GlobalThis` interfaces with these properties.

## Phase 2: Variable Declarations & Scope
`adventure-kit.ts` declares variables that conflict with other scripts or are treated as duplicates because they share the global scope.

*   **Duplicate Identifiers:** Fix "Duplicate function implementation" errors.
    *   Example: `setCoordTarget` might be defined multiple times or colliding with declarations.
*   **Implicit Globals:** Ensure variables like `moduleData`, `editNPCIdx`, `selectedObj` are properly typed and declared. `moduleData` is critical as it holds the state of the module being edited.

## Phase 3: DOM & Event Handling
The file interacts directly with DOM elements using `document.getElementById`.

*   **Null Checks:** `document.getElementById` returns `HTMLElement | null`. Code assumes elements exist. Use optional chaining `?.` or explicit type assertions (e.g., `as HTMLInputElement`) where appropriate.
*   **Element Types:** Fix errors like "Property 'value' does not exist on type 'HTMLElement'" by casting to `HTMLInputElement` or `HTMLTextAreaElement`.
    *   Example: `document.getElementById('npcId').value` -> `(document.getElementById('npcId') as HTMLInputElement).value`.

## Phase 4: Data Structures
Many objects are typed as `any` or `unknown`.

*   **Interfaces:** Define or reuse interfaces for:
    *   `ModuleData` (partially exists in `global.d.ts` but needs to match ACK usage)
    *   `NPC`, `Item`, `Building`, `Zone`, `Portal`, `Event`
    *   `DialogTree` and `DialogNode`
*   **Refining Types:** Replace `object` or `any` with specific interfaces to catch property access errors.

## Phase 5: Execution
1.  **Iterative Fixes:**
    *   Start by adding missing global types. This should reduce the error count significantly.
    *   Address DOM casting issues.
    *   Fix logic errors (e.g., `Timeout` vs `number`).
2.  **Remove Directive:** Once errors are cleared, remove `// @ts-nocheck` from the top and bottom of `ts-src/scripts/adventure-kit.ts`.
3.  **Verify:** Run `npm run build:ts` to ensure a clean build.

## Notes
*   **Refactoring:** While not strictly required to remove `ts-nocheck`, splitting this 6000+ line file into smaller modules would improve maintainability and make typing easier. Consider this for a follow-up task.
*   **Legacy Code:** Be careful when modifying global variable initializations to avoid breaking runtime behavior in the browser.
