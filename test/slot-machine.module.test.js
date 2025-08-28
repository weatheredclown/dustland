import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('dustland module adds slot shack with gambling options', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /interiorId: 'slot_shack'/);
  assert.match(src, /id: 'slots'/);
  assert.match(src, /\(1 scrap\)/);
  assert.match(src, /\(5 scrap\)/);
  assert.match(src, /\(25 scrap\)/);
});
