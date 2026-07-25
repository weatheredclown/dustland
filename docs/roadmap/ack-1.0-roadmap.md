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
*Status: implemented 2026-07-24 (see notes per item).*

- [x] **Dialog search & filter** — toolbar in the dialog modal: text search across node ids, text, choice labels, and success/failure lines; filters for nodes with effects, stat checks, conditions, and unreachable nodes (engine-entered nodes recognized). Shows "N of M nodes" while active.
- [x] **Copy/paste dialog subtrees** — a copy button on every node card grabs the node plus everything it links to; the clipboard lives in `localStorage`, so it survives switching NPCs. Paste merges with collision-safe renaming and remaps internal links.
- [x] **Dialog templates** — "Insert template…" dropdown: greeting, fetch quest (accept/turn-in wired to the quest engine's `q` choices and `do_turnin` node), locked gatekeeper (with `locked` node), and lore branches. Inserted templates auto-link from `start`.
- [x] **Conditional preview** — the inline preview now honors spoofed flags (`if` conditions with all operators), required/cost items, and tags; unavailable choices render disabled with the reason in their tooltip. Stat-check choices offer explicit "pass"/"fail" buttons showing the success/failure text and branching accordingly. Spoof panel values persist across edits instead of resetting. (Spoofed in-game playback already existed.)
- [x] **Visual dialog graph (read-only)** — collapsible "Graph view" in the dialog modal: SVG layered by BFS depth from engine entry nodes, edges for choice links, orphans outlined in orange, click any box to scroll to and flash its node card. Draggable editing remains post-1.0.

**Done when:** a writer can find any line of dialog in seconds, reuse a quest-dialog pattern without rebuilding it, and verify every branch without leaving the editor. ✅

## Milestone 3 — Discoverability: the editor explains itself

*Everything exists but nothing is introduced. New creators must currently discover 13 tabs by clicking.*
*Status: implemented 2026-07-24 (see notes per item).*

- [x] **First-run onboarding** — a dismissible "Start here" card above the tabs with the suggested build order (world → buildings → NPCs → quests → playtest) and pointers to the Wizards tab and Problems card. Shows until dismissed (`localStorage`); the new "? Help" toolbar button brings it back any time.
- [x] **Contextual help per panel** — every entity tab now opens with a one-line `panel-hint` explaining what the entity is and where it fits (all 14 panels).
- [x] **Sticky action buttons** — `.editor-actions` is now position-sticky with a backing panel; Items, Buildings, Interiors, Portals, Quests, Zones, Encounters, Templates, and Arenas buttons were wrapped to match the panels that already had wrappers (NPC, Events, Personas, Zone FX).
- [x] **Keyboard** — Ctrl+1–9 switches the first nine entity tabs; Escape closes the dialog tree modal (persisting edits). Ctrl+S/P/Z/Y already existed. A full tab-order audit remains a manual QA task.
- [x] **Navigation context** — an `#editorContext` line under the tabs shows the active tab and the entity being edited (wired for NPCs, Items, Quests, Buildings, Interiors, Personas). NPC editor sections now remember their open/closed state across sessions.
- [x] **Consistent feedback** — every entity save now confirms visibly ("Item saved.", "Quest saved.", …) via the existing notice elements with auto-clear; NPC already had it. Deletes were already guarded by confirm dialogs; cloud actions already have status reporting.

**Done when:** a first-time user can build without reading external docs, and no action completes silently. ✅

## Milestone 4 — Guided creation covers the core loop

*Wizards exist for NPC+Quest, Chest, and Building. 1.0 needs the full "first module" path guided.*
*Status: implemented 2026-07-24 (see notes per item).*

- [x] **Starter Module wizard** — name → seed → world generation → player start → first NPC with greeting → fetch quest with placed item → one building. Picked tiles snap to the nearest walkable terrain so the module is playable immediately. (The wizard placement canvas is still the simple 16×16 picker, so positions land in the map's top-left region — improving it is a post-1.0 nicety.)
- [x] **Encounter wizard** — map + zone tag or road-distance band → enemy template (pick existing or create with HP/ATK/DEF) → loot drop with chance % → confirm. "Spawn count" is not a per-encounter engine concept (banks spawn by distance/zone), so the wizard exposes exactly what the engine supports.
- [x] **Expanded Quest wizard** — the NPC & Quest wizard now offers fetch, kill, and explore quests with a reward step (scrap, optional item, optional XP). Kill quests count trophy drops wired into the enemy template's loot table; explore quests plant a tile event that sets the quest's `reqFlag`. Quest-giver dialog is auto-generated with `q: accept`/`q: turnin` choices and a `do_turnin` node, matching the quest engine's conventions.
- [x] **Dynamic asset pickers in all wizards** — portraits come from the editor's portrait list (`ackPortraits`) with a custom-path escape hatch; item, enemy-template, and map pickers read live module data via `ackGetModuleData`. The Chest wizard (previously registered but never loaded by adventure-kit.html) plus the new wizards are now on the page. Remaining hardcoded list: the Building wizard's two `.tmx` interior layouts.

**Done when:** the wizard tab alone can produce a complete playable module. ✅

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
