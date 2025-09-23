# Bunker Fast Travel: Drift Between Havens

*By Alex "Echo" Johnson*
> **Priority:** 6 – Travel QoL.
*Date: 2025-09-06*
*Status: Draft*

## Status update
As of 2025-09-07, bunkers derive from building data and core travel logic with events exists. The world map overlay now shows a simplified network of nodes for each unlocked bunker and uses per-bunker save slots to preserve state across hops.

As of 2025-09-08, fuel costs apply a base price plus Manhattan distance, and travel events emit `{ fromId, toId, result }` payloads for mod hooks.
Module items can now include a `fuel` field that grants that amount on pickup, easing fuel cell placement through the Adventure Kit.

### Open questions
that map rather than a raw reload of the module from the JS file?
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
2. **Costs:** Each jump consumes `fuel cells`; the first trip is free to ease onboarding. Fuel comes from scripted rewards (quests, caches, traders) so speed-clearing content stays faster than grinding random fights.
3. **Event Hooks:** Travel may trigger ambush or story events en route.
4. **UI:** World map highlights linked bunkers; select and confirm to jump.

## Implementation Sketch
- [ ] Create `scripts/core/fast-travel.js` handling node graphs and fuel costs.
- [ ] Hook into map UI in `scripts/ui/world-map.js` to select destinations.
- [ ] Emit `travel:start` and `travel:end` events for mods.
  - [ ] Use the Manhattan distance between bunker coordinates from building definitions. Fuel cost scales as `BASE_COST + distance * FUEL_PER_TILE`, keeping math cheap on the grid.
  - [ ] Implementation Sketch references `scripts/ui/world-map.js`
  - [ ] fast travel Destination selection lives in a new `scripts/ui/world-map.js` overlay. It draws a rectangular, subway-style map with connected nodes for each unlocked bunker.
  - [ ] The map functions as a hub above individual modules. Choosing a node loads that module while preserving party state and active quests.
  - [ ] To verify cross-module travel, build a proof-of-concept `two-worlds` module:
    - [ ] create a two worlds module added to module select
    - [ ] create a world one module (not added to module select)
    - [ ] create a world two module (not added to module select)
    - [ ] in world one: add an NPC with item & item fetch quest
    - [ ] in world two: add an NPC with item & item fetch quest
    - [ ] add a fast travel destination bunker in each world
    - [ ] in both worlds, seed hand-authored salvage caches and timed courier events that award enough power cells to demonstrate multi-hop travel without repetitive farming
    - [ ] finishing the world 1 item fetch quest should unlock fast travel to world two by unboarding the door to the bunker (the bunker in world 2 should not ever be boarded)
    - [ ] going into the bunker and choosing to fast travel should trigger a newly implemented scripts/ui/world-map.js
    - [ ] scripts/ui/world-map.js should draw a rectangular subway-style map showing all unlocked fast travel nodes and allow for selection
    - [ ] fast travelling between worlds should load the new map world, party and open quests should be retained across the module load boundary
    - [ ] travelling back to the other world, completed quests/chosen dialog/taken item state should be preserved. perhaps a mechanism for this should be to generate a saved game when moving between maps and you travel back to a save of 
> **Wing:** Make sure fuel costs scale with distance so speedrunners can't warp past the curve.

## Risks
- Overuse could trivialize navigation content.
- Network bugs might strand players without fuel.

## Prototype
`node scripts/fast-travel-prototype.js` connects two bunkers and logs fuel drain per hop.
