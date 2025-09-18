import assert from 'node:assert';
import fs from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

test('shop grudge persists after save/load', async () => {
  const { context } = createGameProxy([]);
  context.console = console;
  context.globalThis = context;

  const store = new Map();
  context.localStorage = {
    getItem(key){ return store.has(key) ? store.get(key) : null; },
    setItem(key, value){ store.set(key, String(value)); },
    removeItem(key){ store.delete(key); }
  };
  context.window.localStorage = context.localStorage;

  const files = [
    '../scripts/event-bus.js',
    '../scripts/core/actions.js',
    '../scripts/core/effects.js',
    '../scripts/core/spoils-cache.js',
    '../scripts/core/abilities.js',
    '../scripts/core/party.js',
    '../scripts/core/inventory.js',
    '../scripts/core/movement.js',
    '../scripts/core/dialog.js',
    '../scripts/core/combat.js',
    '../scripts/core/quests.js',
    '../scripts/core/npc.js',
    '../scripts/game-state.js',
    '../scripts/dustland-core.js'
  ];
  for (const file of files){
    const code = await fs.readFile(new URL(file, import.meta.url), 'utf8');
    vm.runInContext(code, context, { filename: file });
  }

  context.Dustland.updateTradeUI = () => {};

  const moduleData = {
    id: 'test_module',
    name: 'Test Module',
    npcs: [
      {
        id: 'shopkeep',
        map: 'world',
        x: 5,
        y: 5,
        color: '#fff',
        name: 'Shopkeep',
        title: 'Vendor',
        tree: { start: { text: 'Hello', choices: [{ label: '(Leave)', to: 'bye' }] } },
        shop: { markup: 1.2, inv: [{ id: 'water_flask' }] }
      }
    ],
    items: [
      {
        id: 'water_flask',
        name: 'Water Flask',
        type: 'consumable',
        value: 5
      }
    ]
  };

  context.applyModule(moduleData);
  const npc = context.NPCS.find(n => n.id === 'shopkeep');
  assert.ok(npc, 'shop NPC missing after module load');
  npc.shop.grudge = 3;
  npc.shop.markup = 2.5;

  context.save();
  const saved = store.get('dustland_crt');
  assert.ok(saved, 'save data missing');
  store.clear();
  store.set('dustland_crt', saved);
  context.NPCS.length = 0;

  await context.load();

  const reloaded = context.NPCS.find(n => n.id === 'shopkeep');
  assert.ok(reloaded, 'shop NPC missing after reload');
  assert.strictEqual(reloaded.shop.grudge, 3);
  assert.strictEqual(reloaded.shop.markup, 2.5);
});
