import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import '../data/modules/schema.js';
import { listModuleSources } from '../scripts/supporting/module-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const schema = globalThis.ACK_MODULE_SCHEMA;
assert.ok(schema, 'ACK_MODULE_SCHEMA must be defined');

const ajv = new Ajv({ allErrors: true, verbose: true });
const validate = ajv.compile(schema);

function collectModules() {
  // The checked-in state: DATA blocks baked into modules/*.module.js plus
  // standalone *.module.json files in modules/ and the repo root.
  const items = listModuleSources(rootDir).map(({ file, data }) => ({ name: file, data }));

  // Transient one-way exports in data/modules/*.json (not checked in), when present.
  const dataModulesDir = path.join(rootDir, 'data', 'modules');
  if (fs.existsSync(dataModulesDir)) {
    for (const f of fs.readdirSync(dataModulesDir)) {
      if (f.endsWith('.json') && !f.includes('schema')) {
        const fullPath = path.join(dataModulesDir, f);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        items.push({ name: `data/modules/${f}`, data });
      }
    }
  }

  return items;
}

test('all game module builds and JSON files conform strictly to ACK_MODULE_SCHEMA', () => {
  const modules = collectModules();
  assert.ok(modules.length > 0, 'Should find modules to validate');

  const errorsByModule = {};

  for (const { name, data } of modules) {
    const valid = validate(data);
    if (!valid) {
      errorsByModule[name] = validate.errors.map(err =>
        `${err.dataPath || 'root'}: ${err.message} (${JSON.stringify(err.params)})`
      );
    }
  }

  assert.deepStrictEqual(
    errorsByModule,
    {},
    `Module schema validation failures:\n${JSON.stringify(errorsByModule, null, 2)}`
  );
});

test('schema rejects malformed module data', () => {
  assert.ok(!validate({ npcs: [{ map: 'world', x: 1, y: 2 }] }), 'npc without id must fail');
  assert.ok(!validate({ portals: [{ map: 'world', x: 1, y: 2 }] }), 'portal without destination must fail');
  assert.ok(!validate({ totallyUnknownKey: true }), 'unknown top-level property must fail');
  assert.ok(
    !validate({ npcs: [{ id: 'a', map: 'world', x: 1, y: 2, tree: { start: { text: 'hi', choices: [{ to: 'bye' }] } } }] }),
    'dialog choice without label must fail'
  );
  assert.ok(
    !validate({ npcs: [{ id: 'a', map: 'world', x: 1, y: 2, combat: { HP: 'lots' } }] }),
    'non-numeric combat HP must fail'
  );
  assert.ok(
    validate({ seed: 'ok', name: 'minimal', npcs: [], items: [] }),
    'minimal valid module must pass'
  );
});
