import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

function loadModuleData() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const DATA_START = 'const DATA = `\n';
  const start = src.indexOf(DATA_START) + DATA_START.length;
  const end = src.indexOf('`', start);
  return JSON.parse(src.slice(start, end));
}

test('dustland module adds slot shack with gambling options', () => {
  const data = loadModuleData();
  assert.ok(data.buildings.some(b => b.interiorId === 'slot_shack'));
  const slotNpc = data.npcs.find(n => n.id === 'slots');
  assert.ok(slotNpc);
  const labels = slotNpc.tree.start.choices.map(c => c.label);
  assert.ok(labels.includes('(1 scrap)'));
  assert.ok(labels.includes('(5 scrap)'));
  assert.ok(labels.includes('(25 scrap)'));
});

test('slot shack interior includes an exit door', () => {
  const data = loadModuleData();
  const interior = data.interiors.find(i => i.id === 'slot_shack');
  assert.ok(interior);
  assert.ok(interior.grid.some(row => row.includes('🚪')));
});

test('slot machine drops cache after paying out 500 scrap net', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
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
  context.DUSTLAND_MODULE.postLoad(context.DUSTLAND_MODULE);
  const slotNpc = context.DUSTLAND_MODULE.npcs.find(n => n.id === 'slots');
  const play = slotNpc.tree.start.choices.find(c => c.label === '(25 scrap)').effects[0];
  for (let i = 0; i < 20; i++) play();
  assert.strictEqual(context.NPCS.length, 0);
  assert(context.itemDrops.some(d => d.id === 'cache-vaulted'));
});
