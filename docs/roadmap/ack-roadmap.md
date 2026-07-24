# Adventure Construction Kit — Feature Roadmap

*A phased plan for turning the ACK from a capable but rough editor into a polished, community-ready creation suite.*

---

## Current State Summary

The ACK already supports full CRUD for all 13 entity types (NPCs, items, buildings, interiors, portals, quests, events, arenas, zones, encounters, templates, wizards, paint). It has a branching dialog tree editor with live preview, procedural world generation, cloud save/load/publish via Firebase, two guided wizards (NPC+Quest, Chest), and a validation system with clickable problem cards. The major gaps are UX polish, missing editor surfaces for some data, undo/redo, and tooling to help non-technical creators build complete modules without touching JSON.

---

## Phase 1: Editor Reliability & Quality of Life

*Goal: Eliminate data-loss risk and reduce friction for existing workflows.*

### 1.1 Undo / Redo
- Implement a global history stack for all module mutations (entity CRUD, tile paint, field edits).
- Wire Ctrl+Z / Ctrl+Y and add Undo/Redo buttons to a persistent top toolbar.
- Map paint operations group consecutive strokes into a single undo entry.

### 1.2 Autosave & Dirty-State Tracking
- Track dirty state per edit session; warn on browser close with unsaved changes (`beforeunload`).
- Periodic autosave to `localStorage` (configurable interval, default 60s).
- Visual indicator (dot on Save button or tab title) when unsaved changes exist.

### 1.3 Inline Validation Improvements
- Required-field outlines that glow until valid input is provided.
- Disable Save/commit buttons until prerequisites are met, with inline hints explaining why.
- Duplicate-ID detection across all entity types with link to the existing entity.
- Extend validation to catch orphan portals (portal targets that don't exist), encounters referencing missing templates, and quests assigned to nonexistent NPCs.

### 1.4 Sticky Action Buttons
- Pin Save / Discard / Done to the bottom of every editor panel so they're always visible in long forms.

---

## Phase 2: Missing Editor Surfaces

*Goal: Every data field editable in the module schema should have a UI — no more raw-JSON workarounds.*

### 2.1 Shop Inventory Editor
- Add an item-picker list to the NPC shop section so creators can populate `shop.inv[]` with items, quantities, and restock rules.
- Support "import from module items" to quickly seed a shop from existing item definitions.

### 2.2 Zone Effects Editor
- New editor panel (or section under Zones) for `zoneEffects` entries.
- Fields: zone tag, effect type, parameters, duration, message.

### 2.3 Multi-Event Tiles
- Allow multiple events per tile in the event editor (add/remove event rows per coordinate).
- Show event stacks visually on the map overlay.

### 2.4 Persona Editor
- Dedicated panel for creating and editing `personas` entries (ID, label, portrait, narrative prompt).
- Link personas to items that grant them.

### 2.5 Module Properties Panel
- Consolidated panel for module-level settings: name, description, author, version, bunker travel scope, proc-gen seed/params, tags.
- Module thumbnail/preview image upload.

---

## Phase 3: Dialog & Narrative Tooling

*Goal: Make branching dialog fast and visual enough for writers, not just developers.*

### 3.1 Visual Dialog Graph
- Render the dialog tree as a node-graph with draggable nodes and visible connection lines (Canvas or SVG overlay).
- Clicking a connection highlights the choice that links two nodes.
- Orphan and broken-link nodes highlighted inline in the graph.

### 3.2 Dialog Search & Filter
- Text search across all dialog node text and choice labels.
- Filter by: nodes with effects, nodes with stat checks, orphan nodes, nodes reachable from root.

### 3.3 Multi-Node Operations
- Select multiple nodes (shift-click / box-select) for bulk delete, move, or copy.
- Copy/paste dialog subtrees between NPCs.

### 3.4 Dialog Templates
- Preset dialog patterns: greeting + shop, fetch quest accept/turnin, locked-door gatekeeper, info dump with lore branches.
- One-click insert that wires up the template and lets the creator fill in text.

### 3.5 Conditional Preview
- In-editor dialog playtest that lets the creator set arbitrary flags, inventory, and stats to test every branch without launching the game.
- Step-through mode that highlights the current node in the graph as you click choices.

---

## Phase 4: Wizard Expansion

*Goal: Cover the most common creation tasks with guided workflows so new creators never need to touch the raw editor for basic modules.*

### 4.1 Building & Interior Wizard (activate existing code)
- The `TilemapPickerStep` and `DoorLinkerStep` components exist but the Building Wizard is not registered. Wire it up and register it in `Dustland.wizards`.
- Test the side-by-side door-linking flow end-to-end.

### 4.2 Encounter Wizard
- Steps: Pick zone or tile → Pick/create enemy template → Set count and chance → Configure loot table → Confirm.
- Auto-creates the template if one doesn't exist for the chosen enemy type.

### 4.3 Quest Wizard (expanded)
- Go beyond fetch quests: support kill quests (defeat N enemies of template), exploration quests (visit tile/zone), and multi-step quest chains.
- Step for wiring reward (XP, scrap, item, unlock NPC).
- Auto-generate dialog nodes for quest-giver NPC.

### 4.4 Arena Wizard
- Steps: Pick map → Define waves (template, count, challenge) → Set rewards → Add vulnerability mechanics → Confirm.
- Visual wave timeline preview.

### 4.5 Dynamic Asset Pickers in Wizards
- Replace hardcoded portrait filenames and item IDs with pickers populated from the current module data and the full asset library.
- Allow inline upload of new portraits/sprites during wizard flow.

### 4.6 "Starter Module" Wizard
- Full guided flow for bootstrapping a new module from scratch: name it, generate or paint a world, place a player start, add a first NPC with dialog, create one quest, place one building.
- Produces a playable (if minimal) module in under 5 minutes.

---

## Phase 5: UX Overhaul

*Goal: Implement the vision from `ack-ux-overhaul.md` — the editor should feel professional and discoverable.*

### 5.1 Tab & Navigation Polish
- Larger tab labels with paired icons and high-contrast active state.
- Breadcrumb bar showing context (e.g., "NPCs > settler_jax > Dialog Tree").
- Contextual help links to relevant docs per panel.

### 5.2 NPC Editor Restructure
- Separate creation from commit: New NPC opens a fresh pane with Save/Discard actions.
- Lock map selection until ID/Name/Title are provided.
- Persist map coordinate selection visibly after clicking away.

### 5.3 Collapsible Sections
- All entity editors use collapsible `<details>` sections with clear headers: Identity, Appearance, Placement, Dialog, Services, Combat.
- Remember open/closed state per session.

### 5.4 Keyboard Navigation
- Logical tab order through all controls.
- Enter/Escape shortcuts for Save/Discard in every panel.
- Aria-labels on all interactive elements.
- Ctrl+1 through Ctrl+9 for quick tab switching.

### 5.5 Responsive Layout
- Flex-based panels that work at narrower viewports and browser zoom levels.
- Map overlays adapt to DPI changes.

---

## Phase 6: Custom Assets & Painting (complete the design)

*Goal: Finish the asset pipeline described in `custom-tile-assets.md`.*

### 6.1 Asset Manifest & Validation
- Enforce upload limits (1 MB, 1024x1024 px, PNG/WebP only).
- Persist `customAssets` manifest with checksum, size, and uploader metadata.
- Refcount-guarded delete so assets in use can't be removed.

### 6.2 Asset Library Drawer
- Global panel listing all uploaded assets with usage counts, preview thumbnails, and reuse/delete actions.
- Search/filter by name, type, dimensions.

### 6.3 Palette Skin System
- `tileGraphics` panel to swap default palette tiles with custom sprites, scoped globally, per-map, or world vs. interior.
- Swatch preview with checksum badge.

### 6.4 Paint Undo/Redo
- Integrate tile painting with the Phase 1 undo/redo stack.
- Brush collision checks (warn when painting on water/wall unless force-enabled).

### 6.5 Firestore Asset Storage
- Upload assets to a configured remote bucket (signed URLs).
- Sync manifest between local and cloud on save/load.

---

## Phase 7: Collaboration & Sharing

*Goal: Make it easy for creators to share, remix, and collaborate on modules.*

### 7.1 Module Versioning
- Version history with diff view (what changed between saves).
- Restore any previous version from the cloud picker.

### 7.2 Real-Time Collaborative Editing
- Firestore-backed presence and conflict resolution for simultaneous editors.
- Cursor/selection indicators showing who is editing what.

### 7.3 Module Marketplace Polish
- Public module browser with search, tags, ratings, and download counts.
- Featured/curated module collections.
- One-click "remix" that forks a published module into the creator's workspace.

### 7.4 Module Dependency System
- Allow modules to declare dependencies on other modules (shared NPCs, items, quest chains).
- Warn on missing dependencies at load time.

---

## Phase 8: Advanced Creation Tools

*Goal: Power-user features for ambitious module creators.*

### 8.1 Scripting / Event System
- Visual event editor: trigger → condition → action chains.
- Predefined triggers: on-enter-zone, on-talk-NPC, on-pickup-item, on-quest-complete, on-combat-end.
- Predefined actions: spawn NPC, change weather, play SFX, show cutscene text, teleport party.
- No raw JS required — everything configurable through the UI.

### 8.2 Cutscene / Narrative Sequence Editor
- Timeline-based editor for scripted sequences: camera pan, dialog overlay, NPC movement, screen effects.
- Preview playback in the editor.

### 8.3 Procedural Content Helpers
- One-click populate a zone with randomized encounters scaled to a target difficulty.
- Auto-generate loot tables based on module economy parameters.
- Scatter NPCs across a zone with configurable density and type distribution.

### 8.4 Module Testing Suite
- In-editor "smoke test" that walks every NPC dialog tree, verifies all portals connect, checks quest completability, and reports issues.
- Difficulty estimator that simulates combat encounters and flags over/under-tuned templates.

### 8.5 Import/Export Interop
- Export module as a standalone HTML file (self-contained playable page).
- Import maps from common tilemap formats (Tiled JSON).

---

## Priority & Sequencing

| Phase | Effort | Impact | Dependency |
|-------|--------|--------|------------|
| 1. Reliability & QoL | Medium | High | None — do first |
| 2. Missing Surfaces | Medium | High | None |
| 3. Dialog Tooling | High | High | Phase 1 (undo) |
| 4. Wizard Expansion | Medium | High | Phase 2 (surfaces feed wizards) |
| 5. UX Overhaul | High | Medium | Phase 1 (undo, dirty state) |
| 6. Custom Assets | Medium | Medium | Phase 1 (undo for paint) |
| 7. Collaboration | High | Medium | Phase 6 (asset sync) |
| 8. Advanced Tools | Very High | Medium | Phases 1-5 |

Phases 1 and 2 can run in parallel. Phase 3 and 4 can run in parallel once Phase 1 lands. Phase 5 is a large effort best spread across multiple cycles. Phases 7 and 8 are longer-term and depend on the foundation being solid.
