import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('core startGame has no default module', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const src = fs.readFileSync(path.join(__dirname, '..', 'dustland-core.js'), 'utf8');
  const match = src.match(/function startGame\(\)\{[\s\S]*?\n\}/);
  assert(match);
  assert(!match[0].includes('applyModule'));
});
