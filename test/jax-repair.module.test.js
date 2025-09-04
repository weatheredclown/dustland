import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('jax repair module defines countdown', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'jax-repair.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /startGame\s*=\s*function/);
  assert.match(src, /Repair Bay/);
  assert.match(src, /setInterval/);
  assert.match(src, /generator-meter/);
});
