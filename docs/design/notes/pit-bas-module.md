# PIT.BAS Module Design

*By Priya "Gizmo" Sharma*
*Date: 2025-09-06*
*Status: Draft*

> **Gizmo:** Clean pipelines turn even vintage BASIC dust into plug-and-play modules.

## Overview
`PIT.BAS` is a 1980s-style text adventure in which the player falls into a cavern and must climb out. The current BASIC source lives in `docs/examples/PIT.BAS` and runs standalone.

This document sketches how to port that script into a Dustland module so the pit crawl slots into our world generator and event bus.

## Room, Item, and NPC List

**Rooms (BASIC line number)**
- 10 Cavern (start)
- 100 Large Cavern
- 200 Small Cavern
- 300 Whistle Room
- 400 Golden Gate
- 500 Dungeon
- 600 River Room
- 700 Glass Room
- 800 Bandit Room
- 900 Green House
- 1000 River Bed
- 1100 Troll Room
- 1200 Trophy Room
- 1300 Drain
- 1400 Rag Room
- 1500 Bright Room
- 1700 Pointless Room
- 1800 White Room
- 1900 Shore
- 2000 Whisper Room
- 2100 Wizard Room
- 2200 Roof of House
- 2300 Alice Room
- 2400 Lightning Room
- 2700 Magician's Book Room
- 3100 Air Room
- 3600 Maze: Small Room
- 3900 Bee Room

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

## Room Layout
Rooms are sketched on a 5×5 grid using `x` for walls and `p` for portals. For example:

```
xxpxx
x   x
p   x
x   x
xxxx
```

The above layout yields exits to the west and north.

Small cavern layout:

```
xxpxx
x   x
p   x
x   x
xxxx
```

Large cavern layout:

```
xxxxx
x   p
x   x
x   x
xxxxx
```

## Room Connections

- Cavern: north to Large Cavern; south to Small Cavern; down to Whistle Room
- Large Cavern: south to Cavern; east to Golden Gate
- Small Cavern: north to Cavern
- Whistle Room: up to Cavern; east to Dungeon
- Golden Gate: west to Large Cavern
- Dungeon: north to River Room; south to Glass Room; west to Whistle Room
- River Room: north to Bandit Room; east to Green House; south to Dungeon; west to River Bed (requires air tanks)
- Glass Room: east to Dungeon; down to Troll Room
- Bandit Room: south to River Room; east to Trophy Room
- Green House: west to River Room
- River Bed: north to Drain; east to River Room
- Troll Room: up to Glass Room; east to Rag Room; west to Bright Room
- Trophy Room: west to Bandit Room
- Drain: south to River Bed; west to Rapid Water
- Rag Room: north to Troll Room; east to Whisper Room
- Bright Room: east to Troll Room; north to White Room; up to Pointless Room
- Rapid Water: west to Shore; east to Drain
- Pointless Room: down to Bright Room
- White Room: south to Bright Room; west to Wizard Room
- Shore: east to Rapid Water; up to Roof of House; west to Alice Room
- Whisper Room: west to Rag Room; north to Maze; northeast to Maze
- Wizard Room: east to White Room; west to North/South Passage; up to Lightning Room; south to In-A-Box
- Roof of House: up to Lightning Room; west to North/South Passage; down to Shore
- Alice Room: east to Shore; west to Mirror Alice Room
- Lightning Room: north to Roof of House; down to Wizard Room
- Magician's Book Room: west to Air Room; down to 5800
- Air Room: east to Magician's Book Room; northwest to West Hall
- Maze: Small Room: north to Dead End; east to Maze; west to Maze
- Bee Room: north to Maze; east to Merchant Room; southwest to Flute Room

## Pipeline Notes
 - Hand-build the JSON map based on the room/item/NPC list. Use `node scripts/supporting/append-room.js` to quickly insert rooms and wire portal exits.
   - Specify connections as `<dir>:<room>` where `<dir>` is N, E, S, W, U, or D for up and down staircases.
   - Example: `node scripts/supporting/append-room.js modules/pit-bas.module.js small_cavern N:cavern`.
   - Invoking the script again with the same room name replaces its layout and portals.

> **Gizmo:** No one should hand-wire thirty rooms; let the helper script solder the lines.
 - Port chunks of the pit build helper script to automate repetitive wiring.
 - Hand-build the JSON map based on the room/item/NPC list.

- Include the `docs/examples/PIT.BAS` listing as an optional in-game artifact.
- Validate the JSON with existing module tests before hand-tuning encounters.
- Use existing RNG utilities to reproduce BASIC's randomness.
- Document the process so future retro ports follow the same path.

## Open Questions
- Once the original map ships, should we add optional side tunnels or alternate endings?

## Scaffolding Commands

```sh
# Rooms
node scripts/supporting/append-room.js modules/pit-bas.module.js cavern N:large_cavern S:small_cavern
node scripts/supporting/append-room.js modules/pit-bas.module.js large_cavern E:golden_gate S:cavern
node scripts/supporting/append-room.js modules/pit-bas.module.js small_cavern N:cavern
node scripts/supporting/append-room.js modules/pit-bas.module.js whistle_room E:dungeon S:cavern
node scripts/supporting/append-room.js modules/pit-bas.module.js golden_gate W:large_cavern
node scripts/supporting/append-room.js modules/pit-bas.module.js dungeon N:river_room S:glass_room W:whistle_room
node scripts/supporting/append-room.js modules/pit-bas.module.js river_room N:bandit_room E:green_house S:dungeon W:river_bed
node scripts/supporting/append-room.js modules/pit-bas.module.js glass_room E:dungeon S:troll_room
node scripts/supporting/append-room.js modules/pit-bas.module.js bandit_room E:trophy_room S:river_room
node scripts/supporting/append-room.js modules/pit-bas.module.js green_house S:river_room
node scripts/supporting/append-room.js modules/pit-bas.module.js river_bed N:drain E:river_room
node scripts/supporting/append-room.js modules/pit-bas.module.js troll_room N:glass_room E:rag_room W:bright_room
node scripts/supporting/append-room.js modules/pit-bas.module.js trophy_room W:bandit_room
node scripts/supporting/append-room.js modules/pit-bas.module.js drain E:rapid_water S:river_bed
node scripts/supporting/append-room.js modules/pit-bas.module.js rag_room N:troll_room E:whisper_room
node scripts/supporting/append-room.js modules/pit-bas.module.js bright_room N:white_room E:troll_room S:pointless_room
node scripts/supporting/append-room.js modules/pit-bas.module.js rapid_water E:drain W:shore
node scripts/supporting/append-room.js modules/pit-bas.module.js pointless_room S:bright_room
node scripts/supporting/append-room.js modules/pit-bas.module.js white_room E:wizard_room S:bright_room
node scripts/supporting/append-room.js modules/pit-bas.module.js shore N:roof_of_house E:rapid_water W:alice_room
node scripts/supporting/append-room.js modules/pit-bas.module.js whisper_room N:maze_2800 E:maze_2900 W:rag_room
node scripts/supporting/append-room.js modules/pit-bas.module.js wizard_room N:lightning_room E:north_south_passage S:in_a_box W:white_room
node scripts/supporting/append-room.js modules/pit-bas.module.js roof_of_house N:lightning_room E:north_south_passage S:shore
node scripts/supporting/append-room.js modules/pit-bas.module.js alice_room E:shore W:mirror_alice_room
node scripts/supporting/append-room.js modules/pit-bas.module.js lightning_room N:roof_of_house S:wizard_room
node scripts/supporting/append-room.js modules/pit-bas.module.js magician_book_room S:5800 W:air_room
node scripts/supporting/append-room.js modules/pit-bas.module.js air_room E:magician_book_room W:west_hall
node scripts/supporting/append-room.js modules/pit-bas.module.js maze_small_room N:dead_end E:maze_3700 W:maze_3500
node scripts/supporting/append-room.js modules/pit-bas.module.js bee_room N:maze_2900 E:merchant_room W:flute_room

# Items
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'magic_lightbulb',name:'Magic Lightbulb',type:'quest',map:'cavern',x:3,y:3});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'whistle',name:'Whistle',type:'quest',map:'whistle_room',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'silver_medallion',name:'Silver Medallion',type:'quest',map:'dungeon',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'mace',name:'Mace',type:'quest',map:'dungeon',x:3,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'axe',name:'Axe',type:'quest',map:'dungeon',x:1,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'canteen',name:'Canteen',type:'quest',map:'river_room',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'diamond_ring',name:'Diamond Ring',type:'quest',map:'river_bed',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'key',name:'Key',type:'quest',map:'merchant_room',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'air_tanks',name:'Air Tanks',type:'quest',map:'air_room',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'sunglasses',name:'Sunglasses',type:'quest',map:'rag_room',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'bright_sphere',name:'Bright Sphere',type:'quest',map:'bright_room',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
node -e "import fs from 'node:fs';const m=JSON.parse(fs.readFileSync('modules/pit-bas.module.js','utf8'));m.items.push({id:'lightning_rod',name:'Lightning Rod',type:'quest',map:'roof_of_house',x:2,y:2});fs.writeFileSync('modules/pit-bas.module.js',JSON.stringify(m,null,2));"
```

