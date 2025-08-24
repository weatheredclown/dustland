import assert from 'node:assert';
import { test } from 'node:test';
import '../core/party.js';
import '../core/npc.js';

test('scaleEnemy applies level-based scaling', () => {
  const npc = {};
  scaleEnemy(npc, 3, ['STR', 'AGI']);
  assert.strictEqual(npc.maxHp, 30);
  assert.strictEqual(npc.hp, 30);
  assert.strictEqual(npc.lvl, 3);
  assert.strictEqual(npc.stats.STR, 5);
  assert.strictEqual(npc.stats.AGI, 5);
  assert.strictEqual(npc.stats.INT, 4);
});
