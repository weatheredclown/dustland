import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('movement exposes Dustland namespace', async () => {
  const code = await fs.readFile(new URL('../core/movement.js', import.meta.url), 'utf8');
  const context = { Dustland: { effects: {} }, state: { map: 'world' } };
  vm.createContext(context);
  vm.runInContext(code, context);
  assert.ok(context.Dustland?.movement);
  assert.strictEqual(context.move, context.Dustland.movement.move);
  assert.strictEqual(typeof context.Dustland.move, 'undefined');
});
