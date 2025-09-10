# True Dust Module
*By Alex "Echo" Johnson*
> **Priority:** 4 – Early narrative anchor.

The Dustland opens its eyes with a whisper of grit and memory. "True Dust" drops the caravan at a tight knot of shelter — four squat blocks huddled inside a stone wall, a no-spawn sanctuary against the wastes.

## Starting Hub: Stonegate
- **Layout:** A 2x2 cluster of brick shacks ringed by a weathered wall. The interior is flagged as a safe zone; nothing spawns within.
- **Guardian:** Rygar, a weary gatewatch, offers to travel with the player. He fingers a copper pendant — its twin once worn by his sister Mira. With him in party, townsfolk whisper about Mira's fascination with old radio towers and the pull Rygar feels toward the deep dunes.
- **Wild Fringe:** Rats and feral dogs gnaw at the outskirts, pushing newcomers to learn quick strikes and retreat paths.

## Nearby Threat: The Maw Complex
- **Structure:** An abandoned military bunker of four wide chambers (maw_1 through maw_4) linked by long corridors.
- **Encounters:** Each sector rolls random packs of vermin, undead workers, or soldier remnants with a chance for small loot chests.
- **Boss:** The final chamber holds a stitched zombie foreman. Defeating it drops a cracked radio.
- **Radio Perk:** Equipping the radio triggers a static burst whenever the player nears a buried scrap cache. Waiting on the noise lets the player dig up materials.

## Regional Play: Trade and Corruption
- **Rustwater:** Next-door town run by Mayor Ganton. He skims caravan tolls and secretly arms bandits to keep trade scared and bribe-hungry guards in his pocket.
- **Lakeside:** A calmer settlement by the Red Lake, cut off by the raiders. Rustwater's mayor offers a prototype pulse rifle if the player clears the road so he can resume his own profiteering route.

## Quests and Hooks
1. **Rygar's Echo:** Escort Rygar through the Maw Complex. A note in the foreman's desk mentions a girl with a copper pendant heading for Rustwater. After the bandits fall, a Lakeside dockhand either hands Rygar a blood-specked pendant fragment or, if he's absent, slips the player a warning that someone matching Mira's description was dragged onto a night boat.
2. **Static Whisper:** Use the radio to uncover three scrap caches in the surrounding desert.
3. **Bandit Purge:** Accept Mayor Ganton's deal, track the raiders along the road to Lakeside, and decide whether to expose his racket or keep the rifle.

## Implementation Checklist
- [x] Map Stonegate as a 2x2 hub with wall segments, safe-zone trigger, and Rygar spawn point.
- [x] Scatter rats and wild dogs outside the wall; ensure no spawn inside.
- [x] Build the Maw Complex interior with four connected rooms, random encounter tables, and a foreman's desk containing the Mira note.
- [x] Script Rygar follower logic and pendant animations.
- [x] Add Stonegate gossip NPCs referencing Mira's radio obsession and copper pendant.
- [x] Implement radio item: proximity handler for scrap caches and static toast.
- [x] Place three diggable scrap caches aligned with radio static zones.
- [x] Define pulse rifle item rewarded by Mayor Ganton.
- [x] Script Rustwater corruption dialog and bandit quest chain.
- [x] Design Lakeside dockhand scene: give pendant fragment when Rygar present; deliver warning note when absent.
- [x] Log quest updates for Rygar's Echo, Static Whisper, and Bandit Purge.
- [x] Test Stonegate safety, radio range, bandit balance, and Lakeside branching outcomes.
- [ ] wire up true dust to module select

## Verification Instructions

- **Stonegate Safety**
  1. Spawn inside Stonegate and wait two minutes.
  2. Verify no enemies appear within the walls.

- **Radio Range**
  1. Equip the cracked radio.
  2. Walk the surrounding desert and confirm static bursts near all three scrap caches.

- **Bandit Balance**
  1. Fight the road bandit encounters with baseline gear.
  2. Adjust stats if fights feel too easy or deadly.

- **Lakeside Branching**
  1. Clear the route to Lakeside with Rygar in party, then without him.
  2. Confirm the dockhand gives the pendant fragment when Rygar is present and the warning note when absent.

