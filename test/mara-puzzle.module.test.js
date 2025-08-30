import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('mara puzzle module defines startGame to launch dust storm', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'mara-puzzle.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /startGame\s*=\s*function/);
  assert.match(src, /applyModule\(MARA_PUZZLE\)/);
  assert.match(src, /setPartyPos\(s\.x, s\.y\)/);
  assert.match(src, /setMap\(s\.map/);
  assert.match(src, /You hear a faint chime/);
  assert.match(src, /Listen for chimes to find your way out/);
});
