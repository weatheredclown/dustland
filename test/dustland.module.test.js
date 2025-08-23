import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('dustland module includes plot improvements', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /id: 'road_sign'/);
  assert.match(src, /hall sheltered survivors/);
  assert.match(src, /Radio crackles from the north; idol whispers from the south/);
});
