import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('true dust module defines safe zone and spawns', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'true-dust.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /noEncounters/);
  assert.match(src, /spawns/);
  assert.match(src, /Rygar/);
});
