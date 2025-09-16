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
- [ ] Draft first mask memory quest for dustland (< 600 LOC across quest data, dialog, and tests).
  - [x] create an NPC mask giver (name TBD)
  - [ ] Use `scripts/module-tools/quests.js add` to create the fetch quest and follow-up memory beats (target < 150 LOC by extendi
ng existing quest schema fields).
  - [ ] Script quest triggers and rewards in `modules/dustland.module.js` using CLI helpers so the mask item flows through the jo
urnal (target < 160 LOC).
  - [ ] add dialog to this NPC that explains the above lore about how these aren't just disguises while updating journal entri
es (target < 180 LOC).
  - [ ] Add `test/persona-memory.test.js` to cover quest acceptance, completion, and persona unlock persistence (target < 100 LOC
 by leveraging existing quest harnesses).
- [x] Add portrait and label swap logic to the HUD.
- [ ] Extend ACK schema and editor with reusable profile definitions (target < 500 LOC split across schema + UI updates).
  - [ ] Expand `scripts/module-tools/schema.js` and related prompts to expose `profiles` arrays (target < 180 LOC).
  - [ ] Update `scripts/adventure-kit.js` to render profile pickers inside character/item inspectors (target < 220 LOC).
  - [ ] Document the new profile JSON in `docs/guides/module-cli-tools.md` (target < 80 LOC).
- [ ] Implement profile runtime service for personas, buffs, and disguises (target < 600 LOC across runtime + tests).
  - [ ] Expand `scripts/core/profiles.js` to support stacked effect packs, removal hooks, and save serialization (target < 200 LOC
).
  - [ ] Wire the service into persona equip/unequip flows and the event bus in `scripts/camp-persona.js` and `scripts/event-bus.js
` (target < 180 LOC).
  - [ ] Add regression coverage in `test/profile-service.test.js` for stacking, persistence, and reload handling (target < 180 LOC
).
- [x] Emit `persona:equip` and `persona:unequip` events on the global bus.
- [x] ensure load/save store the equipped persona.
- [ ] Build editor inspector for authoring and testing effect packs into ACK (target < 650 LOC including UI + tests).
  - [ ] Add a `components/wizard/effect-pack-inspector.js` panel with sortable effect lists and preview controls (target < 300 LOC
).
  - [ ] Teach `scripts/adventure-kit.js` to open the inspector from persona, item, and zone dialogs (target < 200 LOC).
  - [ ] Cover the inspector with UI regression in `test/effect-pack-inspector.test.js` (target < 120 LOC using existing DOM fixtu
res).
