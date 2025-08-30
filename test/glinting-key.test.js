import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// verify the Glinting Key transports the party and logs a vision

test('glinting key triggers vision', async () => {
  const code = await fs.readFile(new URL('../modules/dustland.module.js', import.meta.url), 'utf8');
  const context = {
    log(msg){ context.logged = msg; },
    setMap(map){ context.map = map; },
    setPartyPos(x, y){ context.pos = { x, y }; },
    NPCS: []
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  context.DUSTLAND_MODULE.postLoad(context.DUSTLAND_MODULE);
  const key = context.DUSTLAND_MODULE.items.find(i => i.id === 'glinting_key');
  assert.ok(key && key.use && typeof key.use.onUse === 'function');
  key.use.onUse();
  assert.strictEqual(context.map, 'echo_chamber');
  assert.deepEqual(context.pos, { x: 2, y: 2 });
  assert.strictEqual(context.logged, 'A vision of a shining world surrounds you.');
});
