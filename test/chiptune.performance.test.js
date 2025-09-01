import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';

test('generateMelody runs within budget for 100 sequences', async () => {
  const code = await fs.readFile(new URL('../scripts/chiptune.js', import.meta.url), 'utf8');
  const context = { Dustland: { eventBus: { on(){}, emit(){} } } };
  vm.createContext(context);
  vm.runInContext(code, context);
  const gen = context.Dustland.music.generateMelody;
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    gen(i, 64);
  }
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 200, `took ${elapsed}ms`);
});
