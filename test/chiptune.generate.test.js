import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('generateMelody is deterministic', async () => {
  const code = await fs.readFile(new URL('../scripts/supporting/chiptune.js', import.meta.url), 'utf8');
  const context = { Dustland: { eventBus: { on(){}, emit(){} } } };
  vm.createContext(context);
  vm.runInContext(code, context);
  const g = context.Dustland.music.generateMelody;
  const a = g(123, 4);
  const b = g(123, 4);
  assert.deepStrictEqual(a, b);
});
