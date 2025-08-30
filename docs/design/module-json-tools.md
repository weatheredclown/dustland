# Module JSON Tools
*By Priya "Gizmo" Sharma*

We need to let editors tinker with module layouts without touching code. Each JS-driven module will hoist its declarative data into a multiline string so Adventure Kit can edit the JSON directly. Scripts wrap and unwrap that data, while a module picker helper keeps the roster tidy.

## Goals
- Allow round-tripping between `*.module.js` files and standalone JSON.
- Provide cross-platform commands to add or remove modules from the picker.
- Keep scripting hooks separate from declarative content.

## Plan
1. **Module format**
   - At the top of each module file, include `const DATA = \`{\n  ...\n}\`;` holding pure layout JSON.
   - After parsing `DATA`, run a `postLoad(module)` function to sprinkle custom logic (NPC scripts, quests, etc.).
   - Existing modules must be refactored so their gameplay logic lives in `postLoad` and the JSON stays clean.
   - Exported JSON should record its `module` script so ACK can reload it for playtests.
2. **Import / export scripts**
   - Add `scripts/module-json.js` with commands:
     - `node scripts/module-json.js export modules/dustland.module.js` → writes `data/modules/dustland.json`.
     - `node scripts/module-json.js import modules/dustland.module.js` → injects JSON back into the multiline string.
   - Wire npm aliases:
     - `npm run module:export -- <file>`
     - `npm run module:import -- <file>`
3. **Module picker management**
   - Keep module list inline in `scripts/module-picker.js` for local compatibility.
4. **Directory layout**
   - Store exported JSON under `data/modules/`.
   - Keep procedural helpers in `scripts/`.

## Remaining Work
- [ ] Refactor each existing module to the new format.
  - [x] broadcast-fragment-1
  - [x] broadcast-fragment-2
  - [x] broadcast-fragment-3
  - [ ] echoes
  - [ ] dustland
  - [ ] lootbox-demo
  - [ ] office
  - [x] mara-puzzle
- [x] Build automated tests for the import/export tools.
- [x] Verify Adventure Kit loads JSON modules and triggers `postLoad`.
- [x] Document the workflow in `docs/` and update README.

