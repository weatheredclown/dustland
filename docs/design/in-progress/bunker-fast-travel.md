# Bunker Fast Travel: Drift Between Havens

*By Alex "Echo" Johnson*
> **Priority:** 6 – Travel QoL.
*Date: 2025-09-06*
*Status: Draft*

## Status update
As of 2025-09-07, `data/bunkers.js` and core travel logic with events exist. UI hooks remain unimplemented.

### Open questions
- Mechanics 2 mentions distance-based fuel costs; how will the system compute distance between bunkers?
- Implementation Sketch references `scripts/ui/world-map.js`, but the project currently lacks a world map module—where should destination selection live?
  - Is there meant to be a world above the main map? are there a connected set of regions you can travel between that load entirely new modules and the "world map" is the map that connects them? perhaps a world map can be a bunch of thumbnail world maps shown on a.. perhaps a mercator projection or else just a stylized pixel art something.. but each module's world map could be a bunker travel location once unlocked.. it would be cool to load the js file, parse out the map data and render it as a thumbnail though.. then travelling to the new location would load in that new map world.. we have to make sure that world state transfers and is preserved across module changes.
  - let's build a POC module called two-worlds to verify everything works in the engine to support this:
  - Tasks:
    - [ ] create a two worlds module added to module select
    - [ ] create a world one module (not added to module select)
    - [ ] create a world two module (not added to module select)
    - [ ] in world one: add an NPC with item & item fetch quest
    - [ ] in world two: add an NPC with item & item fetch quest
    - [ ] add a bunker in each world
    - [ ] in both worlds, add a relatively simple monster you can randomly encounter in order to grind on collecting power cells to have the fuel to get between worlds
    - [ ] finishing the world 1 item fetch quest should unlock fast travel to world two (and back again)
    - [ ] going into the bunker and choosing to fast travel should trigger a newly implemented scripts/ui/world-map.js
    - [ ] scripts/ui/world-map.js should be able to thumbnail a module's overworld (all modules unlocked for fast travel) and display them and allow for selection
    - [ ] fast travelling betweek worlds should load the new map world, party and open quests should be retained across the module load boundary
    - [ ] travelling back to the other world, completed quests/chosen dialog/taken item state should be preserved. perhaps a mechanism for this should be to generate a saved game when moving between maps and you travel back to a save of that map rather than a raw reload of the module from the JS file?
- Implementation Sketch calls for `travel:start` and `travel:end` events; what payloads should they carry to support mods?

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
