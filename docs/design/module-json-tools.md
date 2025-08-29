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
2. **Import / export scripts**
   - [x] Add `scripts/module-json.js` with commands:
     - `node scripts/module-json.js export modules/dustland.module.js` → writes `data/modules/dustland.json`.
     - `node scripts/module-json.js import modules/dustland.module.js` → injects JSON back into the multiline string.
   - [x] Wire npm aliases:
     - `npm run module:export -- <file>`
     - `npm run module:import -- <file>`
3. **Module picker management**
   - [x] Extend `scripts/module-picker.js` to read a JSON array of enabled modules.
   - [x] Provide `node scripts/module-picker.js add modules/foo.module.js` and `... remove ...`.
   - [x] Hook npm commands:
     - `npm run module:add -- modules/foo.module.js`
     - `npm run module:remove -- modules/foo.module.js`
4. **Directory layout**
   - [x] Store exported JSON under `data/modules/`.
   - [x] Keep procedural helpers in `scripts/`.

## Remaining Work
- Refactor each existing module to the new format.
- Build automated tests for import/export and picker updates.
- Verify Adventure Kit loads JSON modules and triggers `postLoad`.
- Document the workflow in `docs/` and update README.

