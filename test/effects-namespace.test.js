import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('effects exposes Dustland namespace', async () => {
  const code = await fs.readFile(new URL('../core/effects.js', import.meta.url), 'utf8');
  const context = { Dustland: {}, soundSources: [], state: { map: 'world' } };
  vm.createContext(context);
  vm.runInContext(code, context);
  assert.ok(context.Dustland?.effects);
  assert.strictEqual(context.Effects, context.Dustland.effects);
  assert.strictEqual(typeof context.Dustland.Effects, 'undefined');
});
