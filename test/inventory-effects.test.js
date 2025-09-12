import assert from 'node:assert';
import { test } from 'node:test';

// Test inventory-related effects

const setup = async () => {
  global.EventBus = { emit() {} };
  global.player = { inv: [], stats: {} };
  global.party = { length: 1, map: 'cavern', x: 0, y: 0 };
  global.log = () => {};
  global.toast = () => {};
  await import('../scripts/core/inventory.js');
  await import('../scripts/core/effects.js');
  return globalThis.Dustland.effects;
};

test('inventory add/remove effects', async () => {
  const effects = await setup();
  effects.apply([{ effect: 'addItem', item: { id: 'coin', name: 'Coin', type: 'quest', tags: ['treasure'] } }]);
  effects.apply([{ effect: 'addItem', item: { id: 'stone', name: 'Stone', type: 'quest' } }]);
  assert.strictEqual(player.inv.length, 2);

  effects.apply([{ effect: 'replaceItem', remove: 'stone', add: { id: 'rock', name: 'Rock', type: 'quest' } }]);
  assert.strictEqual(player.inv.length, 2);
  assert.ok(player.inv.some(it => it.id === 'rock'));

  effects.apply([{ effect: 'removeItemsByTag', tag: 'treasure' }]);
  assert.strictEqual(player.inv.length, 1);
  assert.strictEqual(player.inv[0].id, 'rock');

  effects.apply([{ effect: 'removeItem', id: 'rock' }]);
  assert.strictEqual(player.inv.length, 0);
});
