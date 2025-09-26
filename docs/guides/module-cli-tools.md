# Module CLI tools

The `scripts/module-tools` directory provides commands for reading and editing
module data. The underlying storage uses JSON today, but the CLI accepts
parameter-based fields so the interface remains stable if the format changes.

## Generate a module file

```sh
node scripts/supporting/json-to-module.js <path/to/module.json>
```

Creates `modules/<name>.module.js` with the JSON embedded in a `DATA` block and
adds the module to the module picker.

## Read values

```sh
node scripts/module-tools/get.js <moduleFile> [path]
```

Prints the entire module data or a nested property.

## Set a value

```sh
node scripts/module-tools/set.js <moduleFile> <path> <value>
```

Updates the field at `path` with `value`. Numbers and booleans are converted
automatically; strings that start with `{` or `[` are parsed as JSON so you can
set objects and arrays directly.

Example:

```sh
node scripts/module-tools/set.js modules/golden.module.json start.x 5
```

## Append to an array

```sh
node scripts/module-tools/append.js <moduleFile> <path> <value|key=value ...>
```

Appends a value to the array located at `path`. Provide a single primitive
value or multiple `key=value` pairs to build an object.

Example:

```sh
node scripts/module-tools/append.js modules/golden.module.json items id=rope name=Rope
```

The tools work with `.module.json` files and `.module.js` files containing a
`const DATA = \`...\`` block. If a needed operation isn't supported, extend the
tools before modifying modules.

## Add an NPC

```
node scripts/module-tools/add-npc.js <moduleFile> key=value [key=value ...]
```

Appends a new NPC object to the module's `npcs` array. Include at least `id`,
`map`, `x`, and `y` as parameters.

## Edit an NPC

```
node scripts/module-tools/edit-npc.js <moduleFile> <npcId> <path> <value>
```

Updates a nested field for the NPC with `npcId`. Paths support dot notation,
letting you change dialog trees or other nested data.

## Delete an NPC

```
node scripts/module-tools/delete-npc.js <moduleFile> <npcId>
```

Removes the NPC with `npcId` from the module.

## Add a building

```
node scripts/module-tools/add-building.js <moduleFile> key=value [key=value ...]
```

Adds a building definition to the module's `buildings` array.

## Edit a building

```
node scripts/module-tools/edit-building.js <moduleFile> <index> <path> <value>
```

Edits the building at the given array index.

## Delete a building

```
node scripts/module-tools/delete-building.js <moduleFile> <index>
```

Removes the building at the provided index.

## Add a zone

```
node scripts/module-tools/add-zone.js <moduleFile> key=value [key=value ...]
```

Appends a new zone object to the `zones` array.

## Edit a zone

```
node scripts/module-tools/edit-zone.js <moduleFile> <index> <path> <value>
```

Changes a field within the zone at the specified index. Paths can target nested
effects or other properties.

## Delete a zone

```
node scripts/module-tools/delete-zone.js <moduleFile> <index>
```

Removes the zone at the given index.

## Delete an encounter

```
node scripts/module-tools/delete-encounter.js <moduleFile> <mapId>
```

Deletes the random encounter list for the specified map. If no encounter lists
remain, the command removes the `encounters` section entirely.

## Clean up Dustland dialog

```
node scripts/module-tools/cleanup-dustland-dialog.js <moduleFile>
```

Moves the Archivist's quest dialog text into the quest entries and removes
redundant explicit `(Leave)` options from NPC dialog trees. Run this against
`modules/dustland.module.js` and the matching JSON in `data/modules/` to keep the
two copies aligned.

## Module schema reference

The CLI tools operate on module files that follow a shared JSON schema. A
complete module object looks like this:

```json
{
  "seed": "unique seed or number",
  "name": "optional module name",
  "start": { "map": "map id", "x": 0, "y": 0 },
  "items": [/* Item */],
  "quests": [/* Quest */],
  "npcs": [/* NPC */],
  "events": [/* TileEvent */],
  "portals": [/* Portal */],
  "interiors": [/* Interior */],
  "buildings": [/* Building */],
  "zones": [/* Zone */],
  "templates": [/* Template */]
}
```

- `challenge` is a 1–10 rating that boosts loot cache drop odds and tier.

### Item

```json
{
  "id": "string",
  "name": "string",
  "type": "weapon|armor|trinket|consumable|quest|spoils-cache",
  "desc": "optional text",
  "value": 0,
  "map": "optional map id for placed items",
  "x": 0,
  "y": 0,
  "slot": "equip slot",
  "mods": { "STAT": 0 },
  "tags": ["key", "tool"],
  "use": { "type": "heal|custom", "amount": 0 }
}
```

### Quest

```json
{
  "id": "string",
  "title": "string",
  "desc": "string",
  "item": "required item id",
  "reward": "reward item id",
  "xp": 0
}
```

### NPC

```json
{
  "id": "string",
  "map": "map id",
  "x": 0,
  "y": 0,
  "name": "string",
  "desc": "optional description",
  "prompt": "optional prompt text",
  "color": "#rgb",
  "symbol": "char",
  "questId": "associated quest id",
  "locked": false,
  "tree": { /* DialogTree */ }
}
```

#### DialogTree

An object keyed by node id. Each node has text and choices.

```json
"start": {
  "text": "string",
  "choices": [ /* Choice */ ]
}
```

#### Choice

```json
{
  "label": "button text",
  "to": "node id",
  "q": "quest step",
  "check": { "stat": "STR", "dc": 5 },
  "once": true,
  "reward": "item id",
  "reqItem": "item id required to select",
  "effects": [/* Effect */],
  "if": { "flag": "story flag" }
}
```

#### Effect

All effects include an `effect` string; additional fields depend on the type.
Common examples:

```json
{ "effect": "toast", "msg": "Shown message" }
{ "effect": "modStat", "stat": "CHA", "delta": 1, "duration": 2 }
{ "effect": "unlockNPC", "npcId": "id" }
{ "effect": "lockNPC", "npcId": "id" }
{ "effect": "addFlag", "flag": "story_flag" }
{ "effect": "openWorldMap", "id": "dest" }
```

### TileEvent

```json
{
  "map": "map id",
  "x": 0,
  "y": 0,
  "events": [ { "when": "enter", "effect": "toast", "msg": "hi" } ]
}
```

### Portal

```json
{
  "map": "source map",
  "x": 0,
  "y": 0,
  "toMap": "dest map",
  "toX": 0,
  "toY": 0
}
```

### Interior

```json
{
  "id": "interior id",
  "w": 0,
  "h": 0,
  "grid": ["tile rows"],
  "entryX": 0,
  "entryY": 0
}
```

### Building

```json
{
  "x": 0,
  "y": 0,
  "interiorId": "interior id",
  "boarded": false
}
```

### Zone

```json
{
  "map": "map id",
  "x": 0,
  "y": 0,
  "w": 0,
  "h": 0,
  "perStep": { "hp": -1, "msg": "damage message" },
  "negate": "item id to ignore perStep",
  "useItem": { "id": "item id", "reward": "loot id", "once": true }
}
```

### Template

```json
{
  "id": "template id",
  "name": "string",
  "portraitSheet": "asset path",
  "portraitLock": false,
  "combat": {
    "HP": 0,
    "ATK": 0,
    "DEF": 0,
    "challenge": 1,
    "special": { "cue": "text", "dmg": 0 }
  }
}
```
- `challenge` is a 1–10 rating that boosts loot cache drop odds and tier.
