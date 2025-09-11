# Bunker Fast Travel: Drift Between Havens

*By Alex "Echo" Johnson*
> **Priority:** 6 – Travel QoL.
*Date: 2025-09-06*
*Status: Draft*

## Status update
As of 2025-09-07, `data/bunkers.js` and core travel logic with events exist. UI hooks remain unimplemented.

### Open questions
- Mechanics 2 mentions distance-based fuel costs; how will the system compute distance between bunkers?
  - Use the Manhattan distance between bunker coordinates in `data/bunkers.js`. Fuel cost scales as `BASE_COST + distance * FUEL_PER_TILE`, keeping math cheap on the grid.
- Implementation Sketch references `scripts/ui/world-map.js`, but the project currently lacks a world map module—where should destination selection live?
  - Destination selection lives in a new `scripts/ui/world-map.js` overlay. It renders each unlocked bunker's overworld as a clickable thumbnail built from module map data.
  - The map functions as a hub above individual modules. Choosing a thumbnail loads that module while preserving party state and active quests.
  - To verify cross-module travel, build a proof-of-concept `two-worlds` module:
  - Tasks:
    - [x] create a two worlds module added to module select
    - [x] create a world one module (not added to module select)
    - [x] create a world two module (not added to module select)
    - [x] in world one: add an NPC with item & item fetch quest
    - [x] in world two: add an NPC with item & item fetch quest
    - [x] add a bunker in each world
    - [x] in both worlds, add a relatively simple monster you can randomly encounter in order to grind on collecting power cells to have the fuel to get between worlds
    - [ ] finishing the world 1 item fetch quest should unlock fast travel to world two (and back again)
    - [ ] going into the bunker and choosing to fast travel should trigger a newly implemented scripts/ui/world-map.js
    - [ ] scripts/ui/world-map.js should be able to thumbnail a module's overworld (all modules unlocked for fast travel) and display them and allow for selection
    - [ ] fast travelling between worlds should load the new map world, party and open quests should be retained across the module load boundary
    - [ ] travelling back to the other world, completed quests/chosen dialog/taken item state should be preserved. perhaps a mechanism for this should be to generate a saved game when moving between maps and you travel back to a save of that map rather than a raw reload of the module from the JS file?
- Implementation Sketch calls for `travel:start` and `travel:end` events; what payloads should they carry to support mods?
  - `travel:start` emits `{ fromId, toId, cost }`.
  - `travel:end` emits `{ fromId, toId, result }` where `result` captures ambushes or story events.

> **Echo:** The wastes sprawl, but our stories shouldn't drown in dead miles. Bunkers can hum with secret routes if we let them.

## Goals
- Reduce traversal grind while preserving exploration stakes.
- Tie fast travel to world fiction via reclaimed bunkers.
- Allow modders to define new travel nodes.

## Mechanics
1. **Discovery:** Activating a bunker terminal adds it to the travel network.
2. **Costs:** Each jump consumes `fuel cells`; the first trip is free to ease onboarding.
3. **Event Hooks:** Travel may trigger ambush or story events en route.
4. **UI:** World map highlights linked bunkers; select and confirm to jump.

## Implementation Sketch
- [x] Add `data/bunkers.js` with coordinates and activation flags.
- [x] Create `scripts/core/fast-travel.js` handling node graphs and fuel costs.
- [ ] Hook into map UI in `scripts/ui/world-map.js` to select destinations.
- [x] Emit `travel:start` and `travel:end` events for mods.

> **Wing:** Make sure fuel costs scale with distance so speedrunners can't warp past the curve.

## Risks
- Overuse could trivialize navigation content.
- Network bugs might strand players without fuel.

## Prototype
`node scripts/fast-travel-prototype.js` connects two bunkers and logs fuel drain per hop.
