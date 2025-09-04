import assert from 'node:assert';
import { test } from 'node:test';

// Stub minimal globals used by inventory
globalThis.EventBus = { emit() {} };

await import('../scripts/core/inventory.js');

test('heal items with zero value are estimated', () => {
  const it = normalizeItem({ id: 'potion', name: 'Potion', use: { type: 'heal', amount: 5 }, value: 0 });
  assert.strictEqual(it.value, 5);
});

test('mod items with zero value are estimated', () => {
  const it = normalizeItem({ id: 'medal', name: 'Medal', mods: { LCK: 1 }, value: 0 });
  assert.strictEqual(it.value, 10);
});

test('boost items with zero value are estimated', () => {
  const it = normalizeItem({ id: 'brew', name: 'Battle Brew', use: { type: 'boost', stat: 'ATK', amount: 2, duration: 3 }, value: 0 });
  assert.strictEqual(it.value, 6);
});
