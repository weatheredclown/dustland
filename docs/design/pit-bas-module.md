# PIT.BAS Module Design

*By Priya "Gizmo" Sharma*
*Date: 2025-09-06*
*Status: Draft*

> **Gizmo:** Clean pipelines turn even vintage BASIC dust into plug-and-play modules.

## Overview
`PIT.BAS` is a 1980s-style text adventure in which the player falls into a cavern and must climb out. The current BASIC source lives in `docs/PIT.BAS` and runs standalone.

This document sketches how to port that script into a Dustland module so the pit crawl slots into our world generator and event bus.

## Room, Item, and NPC List

**Rooms**
- Cavern (start)
- Large Cavern
- Small Cavern
- Whistle Room
- Golden Gate
- Dungeon
- River Room
- Glass Room
- Bandit Room
- Green House
- River Bed
- Troll Room
- Trophy Room
- Rag Room
- Bright Room
- Pointless Room
- White Room
- Whisper Room
- Wizard Room
- Alice Room
- Lightning Room
- Magician's Book Room
- Air Room
- Maze: Small Room
- Bee Room

**Items**
- Magic lightbulb
- Whistle
- Silver medallion
- Mace
- Axe
- Canteen (fillable with water)
- Diamond ring
- Key
- Air tanks
- Sunglasses
- Bright sphere
- Lightning rod

**NPCs**
- Bandit
- Troll
- Merchant
- Dead adventurer
- Bees
- Wizard
- Magician
- Grue

## Goals
- Preserve the original narrative beats and room flow.
- Start from the canonical map in `PIT.BAS` before exploring branches.
- Map BASIC line-number logic to a lightweight JavaScript state machine.
- Expose inputs through our standard menu-driven commands.
- Hand-build a JSON map from the room, item, and NPC list.
- Mirror BASIC's RNG-driven hazards.
- Surface the original `PIT.BAS` listing in-game for nostalgic context.
- Keep assets minimal so modders can remix the module.

## Non-Goals
- Recreating a full BASIC interpreter.
- Introducing new combat mechanics beyond what's in the source.
- Shipping the module before localization and accessibility passes.

## Module Structure
1. **Room Graph** – Translate `GOTO`-driven rooms into a JSON graph consumed by `dustland.module.js`.
2. **Action Handlers** – Replace BASIC input loops with event-bus handlers that advance state.
3. **RNG Hooks** – Mirror BASIC's random checks with `Math.random()` so hazards stay unpredictable.
4. **UI Layer** – Use existing dialog panels; no bespoke UI widgets.
5. **Save Hooks** – Store minimal progress flags so players can retry without replaying the intro.

## Pipeline Notes
- Hand-build the JSON map based on the room/item/NPC list.
- Include the `docs/PIT.BAS` listing as an optional in-game artifact.
- Validate the JSON with existing module tests before hand-tuning encounters.
- Use existing RNG utilities to reproduce BASIC's randomness.
- Document the process so future retro ports follow the same path.

## Open Questions
- Once the original map ships, should we add optional side tunnels or alternate endings?

