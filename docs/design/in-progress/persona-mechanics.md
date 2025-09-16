# Persona Masks & Identity Shifts

*By Alex "Echo" Johnson*
> **Priority:** 9 – Defer until arcs playable.
*Date: 2025-02-14*
*Status: Draft*

> **Echo:** In Dustland, a mask isn't just a disguise—it's a borrowed life. Slipping into another's persona lets survivors dodge foes, unlock buried memories, and rewrite their path through the wastes.

## Summary

Personas are collectible identities that players can equip on main characters. Each persona grants a fresh look, tweaks core stats, and opens quest branches tied to the mask's forgotten past. Swapping personas becomes a narrative and mechanical tool—part fashion, part tactical shift.

## Acquisition & Triggers

- **Story Milestones:** Completing key quests awards a persona tied to the scene.
- **Looted Masks:** Rare caches or elite enemies drop masks that bind to the nearest party member.
- **Social Puzzles:** Some NPCs trade masks if players mirror their behavior or answer lore riddles.
- **Hot-swap:** Once owned, personas can be switched at any camp or safehouse via a simple menu.

## Mechanical Effects

- **Stat Modifiers:** Small bonuses to speed, accuracy, or resilience that encourage different play styles.
- **Ability Shifts:** Certain personas reroute a character's special move (e.g., Mara's mask swaps her dash for a smoke bomb).
- **World Flags:** Equipping a persona can toggle ACK flags that gate dialog options or event triggers.

## Quests & Progression

- **Mask Memories:** Each persona carries a short quest chain that reveals the mask's origin. Completing it upgrades the mask's bonus.
- **Identity Locks:** Specific doors or faction hubs only respond if a matching persona is active.
- **Collectible Sets:** Players who gather full themed sets (e.g., all "Veiled" masks) unlock vanity rewards.

## Gameplay & Visuals

- **Portrait Swap:** UI portrait and overworld sprite update to the persona's art when equipped.
- **Signature Animations:** Abilities tied to personas trigger unique effects or color palettes.
- **HUD Tag:** Active persona label appears next to the character's name for quick reference.

## Fun & Justification

- **Role‑playing:** Masks let players experiment with alternate identities without rerolling characters.
- **Lore Hooks:** Dustland legends whisper that memories cling to masks; wearing one lets echoes of the past guide the present.
- **Collection Drive:** Scavenging for personas adds a light metagame that rewards exploration and curiosity.

## AdventureKit Integration

Dustland's AdventureKit needs a reusable way to express persona logic without hard‑coding mask rules. The proposal is a data‑driven **profile system**:

- **Profiles** bundle a trigger (e.g., mask equipped, weather state, quest flag) with a list of canned effects: stat bumps, ability swaps, world flag toggles, or animation overrides.
- Personas are one flavor of profile, but the same scaffolding can power cursed relics, faction disguises, temporary buffs, or environmental hazards.
- Authors craft profiles in JSON inside ACK; no arbitrary code runs—designers pick from vetted effect types with tweakable numbers and asset IDs.

### AdventureKit Work

- Extend ACK's schema to define profile objects and effect primitives.
- Add a runtime service that applies/removes profiles on actors and refreshes derived stats.
- Provide editor tooling to preview profiles and slot them onto characters, items, or zones.

### Event-Driven Effect Packs

Persona equips and other world moments should fire through the game's event bus. Designers can author **effect packs**—JSON dictionaries that map an event name to an ordered list of effects. When the bus emits that key, the runtime service executes each effect using the same safe primitives as dialog.

- Equipping or unequipping a persona emits `persona:equip` and `persona:unequip` events with the character and mask IDs.
- Effect packs may subscribe to any bus event (combat hits, weather changes, quest flags) and run their bundled effects.
- Packs live directly in the save game so mods or quests can persist custom behaviors without new code.

### Engine Work

- Extend ACK's schema to define profile objects and effect primitives.
- Add a runtime service that applies/removes profiles on actors and refreshes derived stats.
- Implement an event bus bridge that loads effect packs from the save file and invokes their effects when subscribed events fire.

### Editor Work

- Provide tooling to preview profiles and slot them onto characters, items, or zones.
- Add an inspector to author effect packs: choose an event, stack effect primitives, and test-fire the bus.
- Surface a save-game panel that lists installed packs and allows reordering or removal.

## Risks & Open Questions

- Do stacked persona bonuses risk min-max exploits?
- Should mask quests auto-track in the journal or remain hidden surprises?
- How many personas per character before UI gets crowded?

## Tasks

- [x] Prototype persona equip UI at camps (any loot cache mask should be equippable here and yield a persona).
 - [x] Hook persona stat modifiers into combat calculations.
- [ ] Draft first mask memory quest for dustland.
  - [x] create an NPC mask giver (name TBD)
  - [ ] create quest to get a persona mask (anything with the mask attribute from a loot cache)
    - [ ] Outline quest beats (setup, retrieval, and return) so each stage ties into the persona's forgotten memories.
    - [ ] Script quest data in a dedicated module file with journal updates, checkpoint triggers, and persona unlock rewards.
    - [ ] Playtest the quest via Adventure Kit to ensure loot caches drop the correct mask variant and state persists after reloads.
  - [ ] add dialog to this NPC that explains the above lore about how these aren't just disguises
    - [ ] Draft branching acceptance, declination, and completion lines that foreshadow later mask memories.
    - [ ] Gate dialog branches using persona ownership flags so repeat conversations acknowledge prior progress.
    - [ ] Record VO/text pass notes for narrative review and confirm the conversation flows in the in-game UI without clipping.
- [x] Add portrait and label swap logic to the HUD.
- [ ] Extend ACK schema and editor with reusable profile definitions.
  - [ ] Define a `profiles` collection in the ACK schema with validation on effect types, numeric ranges, and asset references.
  - [ ] Add a migration utility that backfills empty `profiles` blocks for existing modules so older content keeps loading cleanly.
  - [ ] Surface profile editors in Adventure Kit with previews of stat deltas and persona-specific restrictions.
- [ ] Implement profile runtime service for personas, buffs, and disguises.
  - [ ] Create `scripts/core/profile-service.js` to apply/remove profile effects and broadcast lifecycle events.
  - [ ] Subscribe the service to `persona:equip`, quest, and environmental triggers so effect packs fire automatically.
  - [ ] Cover the service with save/load and combat regression tests that ensure stacked modifiers resolve deterministically.
- [x] Emit `persona:equip` and `persona:unequip` events on the global bus.
- [x] ensure load/save store the equipped persona.
- [ ] Build editor inspector for authoring and testing effect packs into ACK.
  - [ ] Add an inspector panel that lets designers compose ordered effect packs and bind them to event keys.
  - [ ] Provide a "test fire" sandbox that emits sample events against the active save to preview results without leaving ACK.
  - [ ] Document the workflow in an Adventure Kit guide so modders understand how to author, preview, and ship packs.
