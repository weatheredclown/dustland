import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('movement reads zones added after load', async () => {
  const code = await fs.readFile(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  const context = { Dustland: {}, state: {}, party: [] };
  vm.createContext(context);
  vm.runInContext(code, context);
  context.Dustland.zoneEffects = [ { map: 'world', x: 0, y: 0, w: 1, h: 1, healMult: 2 } ];
  const attrs = context.zoneAttrs('world', 0, 0);
  assert.strictEqual(attrs.healMult, 2);
});
