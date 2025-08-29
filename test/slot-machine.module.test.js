import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

test('dustland module adds slot shack with gambling options', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /interiorId: 'slot_shack'/);
  assert.match(src, /id: 'slots'/);
  assert.match(src, /\(1 scrap\)/);
  assert.match(src, /\(5 scrap\)/);
  assert.match(src, /\(25 scrap\)/);
});

test('slot machine drops cache after paying out 500 scrap net', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  let src = fs.readFileSync(file, 'utf8');
  src = src.replace(/updateHUD\?\.\(\);\n\s{2}\}/, 'updateHUD?.();\n  }\n  globalThis.pullSlots = pullSlots;');
  const context = {
    WORLD_H: 20,
    WORLD_W: 120,
    TILE: { WALL: 0, FLOOR: 1, DOOR: 2 },
    DC: { TALK: 0, REPAIR: 0 },
    CURRENCY: 's',
    player: { scrap: 1000 },
    rng: () => 0.999,
    log: () => {},
    updateHUD: () => {},
    NPCS: [{ id: 'slots', map: 'slot_shack', x: 3, y: 2 }],
    SpoilsCache: { create: rank => ({ id: `cache-${rank}`, name: 'Cache' }) },
    registerItem: item => item,
    itemDrops: [],
    EventBus: { emit: () => {} },
    party: { map: 'slot_shack', x: 3, y: 2 }
  };
  context.removeNPC = npc => {
    const i = context.NPCS.indexOf(npc);
    if (i > -1) context.NPCS.splice(i, 1);
  };
  vm.runInNewContext(src, context);
  const { pullSlots } = context;
  for (let i = 0; i < 20; i++) pullSlots(25, [0, 10, 25, 35, 50]);
  assert.strictEqual(context.NPCS.length, 0);
  assert(context.itemDrops.some(d => d.id === 'cache-vaulted'));
});
