# Prioritized Roadmap Review

*By Dustland CRT Team*

## Team Debrief

- **Clown (Riley):** "Too many side-show specs. Let’s chase the sparks that actually light up the wasteland."
- **Echo (Alex):** "Our caravan needs a spine—clear arcs, bold beats. The rest is garnish."
- **Gizmo (Priya):** "The engine’s coughing. If we don’t clean the pipes, every new gadget we bolt on will rattle loose."
- **Wing (Mateo):** "Combat’s still a tech demo. Until adrenaline and flow land, none of the other features matter."

## Delivery snapshot

- **Combat loop is live**: the adrenaline HUD, specials, and boss telegraph effects are wired into the current combat renderer and status system. The remaining gaps are AI aggression, encounter pacing, and HUD readability at speed.
- **RPG progression is playable**: XP curves, skill points, trainers, Memory Worm respecs, and mentor hooks ship in the runtime. Balancing the curve and upgrading trainer inventories are the open items.
- **Hydration and fast travel shipped**: hydration ticks during movement and consumes items, and bunker terminals feed the world-map fast travel UI. Further polish should focus on messaging and scope controls.
- **Loot and tools landed**: Spoils Cache drops, persona-aware item generation, and the Adventure Kit wizard scaffolding all exist in the codebase. Future work is tuning drop tables and expanding wizard steps.

## Prioritized Roadmap

1. **Type safety and event hygiene** – remove the remaining `@ts-nocheck` headers (combat, movement, core, adventure-kit, engine) and stabilize ambient globals so CI can enforce type coverage.
2. **Combat polish** – tighten enemy AI scripts, add visibility cues for status effects, and lock in HUD layout tweaks for adrenaline and health readability.
3. **Progression tuning** – rebalance XP gain, trainer price ladders, and Memory Worm availability based on the current skill-point loop.
4. **Module cohesion** – finish integrating the True Dust starter path and ensure map fragments and bunker routes align with the existing modules.
5. **Production checks in CI** – schedule `npm run check:prod` as a nightly and pre-release gate to keep synced builds and HTML presubmit coverage.
6. **Economy refresh** – extend trader persistence and inventory refresh rules before adding new vendor locations.
7. **Wizard and tooling extensions** – add more Adventure Kit wizard steps (placement, preview) and keep module CLI coverage healthy.
8. **Multiplayer experiments** – keep on ice until the single-player loop is balanced and stable.

*Dynamic Weather is complete and lives in `docs/design/core-systems/dynamic-weather.md`.*

## Corrective Actions

1. **Quarterly Roadmap Reset** – triage all design docs against player value and drop low-impact work.
2. **Living Backlog Board** – track features by impact/effort instead of document status.
3. **Gatekeeper Sessions** – pitch problems before writing full design docs.
4. **Doc Retirement Policy** – close or consolidate drafts with no champion for two cycles.
5. **Narrative Milestone Reviews** – keep story-driven features like True Dust aligned with core gameplay.
