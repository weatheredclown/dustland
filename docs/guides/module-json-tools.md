# Module JSON CLI tools

The `scripts/module-tools` directory provides commands for reading and editing
module JSON. Always use these tools instead of hand-editing module files.

## Read values

```sh
node scripts/module-tools/get.js <moduleFile> [path]
```

Prints the entire module JSON or a nested property.

## Set a value

```sh
node scripts/module-tools/set.js <moduleFile> <path> <jsonValue>
```

Updates the field at `path` with `jsonValue`. The value must be valid JSON.

Example:

```sh
node scripts/module-tools/set.js modules/golden.module.json start.x 5
```

## Append to an array

```sh
node scripts/module-tools/append.js <moduleFile> <path> <jsonValue>
```

Appends `jsonValue` to the array located at `path`.

Example:

```sh
node scripts/module-tools/append.js modules/golden.module.json items '{"id":"rope","name":"Rope"}'
```

The tools work with `.module.json` files and `.module.js` files containing a
`const DATA = \`...\`` block. If the tools are missing features needed for a
change, update or extend them before modifying modules.

## Add an NPC

```
node scripts/module-tools/add-npc.js <moduleFile> '<npcJson>'
```

Appends a new NPC object to the module's `npcs` array. The JSON must include
`id`, `map`, `x`, and `y`.

## Edit an NPC

```
node scripts/module-tools/edit-npc.js <moduleFile> <npcId> <path> <jsonValue>
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
node scripts/module-tools/add-building.js <moduleFile> '<buildingJson>'
```

Adds a building definition to the module's `buildings` array.

## Edit a building

```
node scripts/module-tools/edit-building.js <moduleFile> <index> <path> <jsonValue>
```

Edits the building at the given array index.

## Delete a building

```
node scripts/module-tools/delete-building.js <moduleFile> <index>
```

Removes the building at the provided index.

## Add a zone

```
node scripts/module-tools/add-zone.js <moduleFile> '<zoneJson>'
```

Appends a new zone object to the `zones` array.

## Edit a zone

```
node scripts/module-tools/edit-zone.js <moduleFile> <index> <path> <jsonValue>
```

Changes a field within the zone at the specified index. Paths can target nested
effects or other properties.

## Delete a zone

```
node scripts/module-tools/delete-zone.js <moduleFile> <index>
```

Removes the zone at the given index.
