import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';

const { context } = createGameProxy({});

test('auto combat NPCs are red', () => {
  const npc = { combat: { auto: true } };
  assert.strictEqual(context.getNpcColor(npc), '#f00');
});

test('non-auto hostile NPCs are pink', () => {
  const npc = { combat: {}, tree: null };
  assert.strictEqual(context.getNpcColor(npc), '#f88');
});
