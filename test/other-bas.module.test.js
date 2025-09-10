import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'modules', 'other-bas.module.js');
const code = fs.readFileSync(file, 'utf8');
vm.runInThisContext(code, { filename: file });

test('other-bas module exposes listing and start map', () => {
  assert.ok(global.OTHER_BAS_MODULE.listing);
  assert.strictEqual(global.OTHER_BAS_MODULE.start.map, 'west_wing');
});

test('other-bas module includes rooms and items', () => {
  assert.ok(global.OTHER_BAS_MODULE.interiors.find(r => r.id === 'garage'));
  assert.ok(global.OTHER_BAS_MODULE.items.find(i => i.id === 'wrench'));
});
