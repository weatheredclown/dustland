import { test } from 'node:test';
import assert from 'node:assert';

test('loadStarterItems seeds items from script', async () => {
  globalThis.EventBus = { emit: () => {} };
  globalThis.player = { inv: [] };
  globalThis.party = [{}];
  await import('../data/items/starter.js');
  await import('../scripts/core/inventory.js');
  loadStarterItems();
  assert.ok(globalThis.player.inv.some(it => it.id === 'starter_canteen'));
});
