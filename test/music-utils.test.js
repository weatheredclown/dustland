import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('clampMidiToScale snaps notes to scale', async () => {
  const code = await fs.readFile(new URL('../scripts/supporting/music-utils.js', import.meta.url), 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  assert.equal(context.clampMidiToScale(61, 'C', 'major'), 60);
  assert.equal(context.clampMidiToScale(63, 'C', 'major'), 62);
});
