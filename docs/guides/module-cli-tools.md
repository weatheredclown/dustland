# Module CLI tools

The `scripts/module-tools` directory provides commands for reading and editing
module data. The underlying storage uses JSON today, but the CLI accepts
parameter-based fields so the interface remains stable if the format changes.

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
automatically; everything else is treated as a string.

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
