# Module JSON Workflow

This guide shows how to round-trip a module's data between its `*.module.js` file and a standalone JSON file.

## Prerequisites
- Node.js installed.
- Module file uses the design pattern `const DATA = \`\n{...}\n\`;` at the top.
- Commands run from the repo root.

## Export a module to JSON
```sh
npm run module:export -- modules/dustland.module.js
```
This writes the module's JSON to `data/modules/dustland.json` and includes a `module` field pointing back to the script.

## Import JSON back into the module
After editing `data/modules/dustland.json`, inject the changes back:
```sh
npm run module:import -- modules/dustland.module.js
```
The script replaces the `DATA` block inside `modules/dustland.module.js`.

## Example: Dustland module
1. Run the export command above to extract `data/modules/dustland.json`.
2. Modify a field in the JSON (e.g., change an NPC name).
3. Run the import command to write the JSON back into `modules/dustland.module.js`.
4. Launch `dustland.html?ack-player=1` and load the module to verify the change.

Remove any temporary JSON files when finished to keep the working tree clean.

## Custom portraits
Modules may reference portrait images by setting a `portraitSheet` field to a
path under `assets/`. The `module-json` tooling keeps these relative paths
intact during export and import. When modules are loaded into Adventure Kit,
these `portraitSheet` paths are preserved even if they fall outside the
default portrait index:

```json
{ "portraitSheet": "assets/portraits/my_npc.png" }
```

## postLoad hooks
Adventure Kit loads a module script when the JSON includes a `module` path. After the script loads, it calls the script's `postLoad(module)` method to apply procedural logic:

```json
{
  "module": "modules/dustland.module.js"
}
```

If the module exposes a different global variable name, provide `moduleVar` to hint the loader.
