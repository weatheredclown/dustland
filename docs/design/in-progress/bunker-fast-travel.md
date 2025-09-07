# Bunker Fast Travel: Drift Between Havens

*By Alex "Echo" Johnson*
> **Priority:** 6 – Travel QoL.
*Date: 2025-09-06*
*Status: Draft*

## Status update
As of 2025-09-07, only a static `data/bunkers.js` exists. Fast travel logic, UI hooks, and travel events remain unimplemented.

### Open questions
- Mechanics 2 mentions distance-based fuel costs; how will the system compute distance between bunkers?
- Implementation Sketch references `scripts/ui/world-map.js`, but the project currently lacks a world map module—where should destination selection live?
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
- [ ] Create `scripts/core/fast-travel.js` handling node graphs and fuel costs.
- [ ] Hook into map UI in `scripts/ui/world-map.js` to select destinations.
- [ ] Emit `travel:start` and `travel:end` events for mods.

> **Wing:** Make sure fuel costs scale with distance so speedrunners can't warp past the curve.

## Risks
- Overuse could trivialize navigation content.
- Network bugs might strand players without fuel.

## Prototype
`node scripts/fast-travel-prototype.js` connects two bunkers and logs fuel drain per hop.
