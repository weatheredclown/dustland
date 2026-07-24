# ACK 1.0 Roadmap — UI & Usability

*What must be finished and improved in the Adventure Construction Kit to call it a complete, polished 1.0. Scoped to UI, functionality, and usability — not new game systems.*

*Grounded in a code audit (2026-07-23) of `ts-src/scripts/adventure-kit.ts`, `adventure-kit.html`, `ts-src/scripts/ack-editor/`, `ts-src/scripts/ack/`, and `ts-src/components/wizard/`. Prior roadmap docs and "Phase complete" commit messages were treated as claims and verified against source.*

---

## What "1.0" means

A creator who has never seen the ACK can build a small, complete, playable module — world, one building, a few NPCs with branching dialog, a quest, an encounter — entirely through the UI, without touching JSON, without losing work, and without hitting a dead end they can't diagnose. Everything the editor lets you create, it also helps you validate, find, and fix.

---

## Verified current state

**Actually done and wired (confirmed in code, not just claimed):**
- Full CRUD for all 13 entity types, each with list filtering and empty states
- Branching dialog tree editor with live preview (form-based)
- Undo/redo — snapshot-based (`ack-editor/undo-manager.ts`), Ctrl+Z/Y, toolbar buttons, called at 33 mutation sites
- Autosave + dirty tracking (`ack-editor/autosave.ts`) — 60s localStorage autosave, `beforeunload` guard, dirty indicator, restore prompt
- Module properties panel (description, author, version, tags, start position, bunker scope)
- Shop inventory editor, zone effects editor, persona editor, multi-event tiles — all shipped
- Building wizard registered (`supporting/wizard-building.ts`), plus NPC+Quest and Chest wizards
- Cloud save/publish/share/load with private/shared/public visibility and a picker modal
- Playtest handoff (Ctrl+P → `dustland.html?ack-player=1`)
- Tile painting with procedural generation, stamps, custom PNG tile uploads

**Claimed done but actually incomplete:**
- ⚠️ Inline validation ("all ACK entity editors", commit `17c6188c`) — only NPCs, Items, Encounters, Templates, Portals, Quests have it. **Buildings, Interiors, Events, Arenas, Zones, Personas, Zone FX have none.**
- ⚠️ Cross-reference validation — portals check their target map, but orphan portal targets, encounters referencing missing templates, and quests assigned to nonexistent NPCs are not comprehensively checked.
- ⚠️ Undo/redo and autosave have **zero test coverage** — the two features most responsible for preventing data loss are unverified.

---

## Milestone 1 — Trust: no lost work, no silent corruption

*The editor must be safe before it is pleasant. Highest priority.*
*Status: implemented 2026-07-24 (see notes per item).*

- [x] **Complete inline validation** for the 7 editors that lacked it (Buildings, Interiors, Events, Arenas, Zones, Personas, Zone FX) — `validateBldgForm`, `validateInteriorForm`, `validateEventForm`, `validateArenaForm`, `validateZoneForm`, `validatePersonaForm`, `validateZoneFxForm`, with live input listeners, save-button gating, hints, and map-bounds checks via `validateRectInMap`.
- [x] **Cross-reference validation** in the Problems card: dialog choices → missing nodes, unreachable dialog nodes, shop inventory → unknown items, unassigned quests, quest fetch items nothing provides, buildings → missing interiors, events/zones/zone effects on missing maps, arena waves → missing templates. All new problem types jump to their editor on click. (Orphan portals, encounter → missing template, and NPC → missing quest checks already existed.)
- [x] **Tests for undo-manager and autosave**: `test/ack-editor-undo.test.js` (round-trip fidelity, 50-snapshot cap, redo-clearing, button states) and `test/ack-editor-autosave.test.js` (dirty tracking, quota-failure surfacing, beforeunload guard, restore prompt accept/decline).
- [x] **Paint stroke undo**: map-canvas strokes were already one snapshot per stroke (mousedown only) — the earlier audit was wrong. Fixed the real gaps: the interior mini-canvas recorded no snapshot at all, and painting never marked the module dirty (so autosave/beforeunload ignored paint-only changes).
- [x] **Autosave resilience**: quota errors now show a visible warning in the new `#autosaveStatus` indicator; successful autosaves show the time; a failed export no longer clobbers the previous good autosave.

**Done when:** every editor flags bad input where it happens; the Problems card catches every dangling reference; a paint drag is one Ctrl+Z; undo/autosave have passing tests in `test/`. ✅

## Milestone 2 — Dialog authoring at scale

*The dialog editor is the richest surface and the biggest friction point. A writer with a 40-node tree currently has no way to search it, no way to see its shape, and no way to reuse work.*

- [ ] **Dialog search & filter**: text search across node text and choice labels; filters for nodes with effects, with stat checks, orphaned, unreachable from root.
- [ ] **Copy/paste dialog subtrees** between nodes and between NPCs.
- [ ] **Dialog templates**: one-click insert for the common patterns (greeting + shop, fetch-quest accept/turn-in, gatekeeper, lore branch) with placeholders to fill in.
- [ ] **Conditional preview**: playtest dialog in-editor with arbitrary flags/inventory/stats set, so every branch is testable without launching the game.
- [ ] **Visual dialog graph (stretch — cut from 1.0 if it slips)**: read-only node-graph rendering with orphan/broken-link highlighting is 1.0-worthy on its own; draggable node editing can wait for 1.x.

**Done when:** a writer can find any line of dialog in seconds, reuse a quest-dialog pattern without rebuilding it, and verify every branch without leaving the editor.

## Milestone 3 — Discoverability: the editor explains itself

*Everything exists but nothing is introduced. New creators must currently discover 13 tabs by clicking.*

- [ ] **First-run onboarding**: a short dismissible tour or "Start here" panel pointing to the wizards and the suggested build order (world → buildings → NPCs → quests).
- [ ] **Contextual help per panel**: a help link/icon on each entity panel to the relevant doc section; upgrade bare `title` tooltips on non-obvious controls (proc-gen params, brush modes, event types) to real explanations.
- [ ] **Sticky action buttons**: pin Save/Discard/Done to the bottom of every editor panel (partial `editor-actions` wrappers exist; finish and pin globally).
- [ ] **Keyboard completeness**: Ctrl+1–9 tab switching; Enter/Escape for save/discard in every panel; verified logical tab order. (Ctrl+S/P/Z/Y already work.)
- [ ] **Navigation context**: breadcrumb or header showing where you are ("NPCs → settler_jax → Dialog"), and collapsible sections with remembered open state in the long forms (NPC editor especially).
- [ ] **Consistent feedback**: every save/clone/delete/cloud action confirms visibly (toast or status line); destructive actions get an undo-toast or confirm.

**Done when:** a first-time user can build without reading external docs, and no action completes silently.

## Milestone 4 — Guided creation covers the core loop

*Wizards exist for NPC+Quest, Chest, and Building. 1.0 needs the full "first module" path guided.*

- [ ] **Starter Module wizard**: name → generate/paint world → place player start → first NPC with dialog → one quest → one building. Target: playable minimal module in under 5 minutes.
- [ ] **Encounter wizard**: zone/tile → enemy template (create if missing) → count/chance → loot → confirm.
- [ ] **Expanded Quest wizard**: kill and exploration quests in addition to fetch; reward step; auto-generated quest-giver dialog nodes.
- [ ] **Dynamic asset pickers in all wizards**: replace remaining hardcoded portrait filenames and item IDs with pickers fed from module data.

**Done when:** the wizard tab alone can produce a complete playable module.

## Milestone 5 — Cloud & finish

- [ ] **Version history UI**: list prior cloud saves with timestamps, load/restore any version (repository has `loadVersion` but only fetches latest; no history list exists).
- [ ] **Module thumbnail/preview image** on the properties panel and in the cloud picker.
- [ ] **Cloud error clarity**: audit the failure paths (auth expired, permission denied, offline) so each shows an actionable message rather than a generic failure.
- [ ] **Responsive layout pass**: panels usable at narrower widths and browser zoom; map overlays adapt to DPI.
- [ ] **Pre-1.0 accessibility audit**: the recent aria-label work is a good base; verify with a screen-reader pass over one full create-an-NPC flow.

**Done when:** creators can recover any prior cloud version, and every cloud failure tells them what to do next.

---

## Explicitly out of scope for 1.0

Deferred to post-1.0 (tracked in `ack-roadmap.md` Phases 6–8): real-time collaborative editing, marketplace ratings/remixing, module dependency system, visual scripting/event chains, cutscene editor, difficulty simulation suite, Tiled import / standalone HTML export, Firestore asset bucket sync, and the full draggable dialog node-graph editor.

## Sequencing

| Milestone | Effort | Rationale for order |
|---|---|---|
| 1. Trust | Medium | Data safety and validation gate everything; also closes the gap between claimed and actual "Phase 1" completion |
| 2. Dialog | Medium-High | Biggest friction on the most-used advanced surface |
| 3. Discoverability | Medium | Makes existing depth reachable by new creators |
| 4. Wizards | Medium | Depends on validation (1) so wizards produce valid data |
| 5. Cloud & finish | Medium | Independent; can run parallel to 3–4 |

Milestones 1 and 2 are the 1.0 gate. 3–5 are what makes it feel *finished* rather than merely *safe*. A reasonable release line: ship 1.0 when 1–4 are complete and Milestone 5 lacks only the responsive-layout pass.
