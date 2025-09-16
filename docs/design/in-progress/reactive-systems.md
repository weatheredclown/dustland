# Reactive Systems for Dustland

*By Priya "Gizmo" Sharma*

> **Gizmo:** Tools first. If we want modders to weave stories, the kit has to track who did what, when, and why. Give them switches, not hard-coded spaghetti.

## Item Story Hooks
- Tag every item with narrative IDs and optional moral prompts.
- Let items trigger events on pickup, use, or trade.
- Adventure Kit exposes item hooks so modules can branch on them.

## Branching Quest Framework
- Quests defined as node graphs with outcomes and failure states.
- Event flags persist decisions and ripple into later modules.
- ACK editor surfaces choice nodes for rapid authoring.

## NPC Memory and Evolution
- Persistent state buckets store favors, grudges, and reputation.
- Dialog trees read those buckets to unlock or lock paths.
- Schedule hooks let NPCs migrate or change roles after big events.

## World Events and Temporal Changes
- Event scheduler ticks global timers and cascading chains.
- Roaming encounters spawn via data-driven templates.
- Time-of-day and weather layers alter maps without reloads.

## Zone and Portal Scaffolding
- Zones register narrative arcs and secrets in a manifest.
- Portals support conditional routing based on story flags.
- Interiors declare entry/exit events so transitions carry emotional beats.

### Action Items
- [x] Implement item narrative tagging in engine and Adventure Kit.
 - [x] Extend quest definitions to support branching and persistence.
 - [x] Add NPC memory storage and retrieval utilities.
- [ ] Build event scheduler for world and NPC timelines.
  - [ ] Specify scheduler data structures (timeline entries, repeat rules, prerequisites) and document them for Adventure Kit authors.
  - [ ] Implement a tick-driven scheduler service that queues world/NPC events, persists progress to saves, and survives map transitions.
  - [ ] Add editor tooling to visualize upcoming events and allow designers to fast-forward or cancel entries during testing.
  - [ ] Write automated tests covering chained events, missed ticks after load, and NPC reactions triggered by the scheduler.
- [x] Allow zones and portals to register and check narrative flags.

