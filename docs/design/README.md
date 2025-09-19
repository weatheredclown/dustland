# Design Documents

*By Dustland CRT Team*

Use these folders to find the right design reference quickly:

- `foundations/` – vision statements, gameplay goals, and the active roadmap.
- `core-systems/` – combat, traversal, survival, and other mechanical pillars.
- `economy-progression/` – loot, vendors, and character growth frameworks.
- `narrative-world/` – story arcs, module breakdowns, and tonal guides.
- `ui-accessibility/` – HUD, dialog flow, and interface polish work.
- `dev-tools/` – editor direction, engine scaffolding, and authoring utilities.

## Codex task snapshots

The generated `codex-tasks.json` snapshot in this folder can feed directly into day-to-day planning.

- Refresh the file when design checklists change: `node scripts/supporting/design-codex-tasks.js`.
- Browse or filter the tasks without opening the JSON: `node scripts/supporting/codex-task-browser.js list trader`.
- Inspect a specific entry for full context: `node scripts/supporting/codex-task-browser.js show docs/design/economy-progression/oasis-trader.md:35`.

The CLI pulls titles, headings, and ancestor bullets from the snapshot so you can quickly jump from the design note to an actionable commit idea.
