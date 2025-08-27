import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/core/party.js';
import '../scripts/core/npc.js';

globalThis.log = () => {};
globalThis.toast = () => {};
globalThis.renderParty = () => {};
globalThis.updateHUD = () => {};
globalThis.hudBadge = () => {};
globalThis.EventBus = { emit() {} };
globalThis.hasItem = () => false;

test('awardXP uses xpCurve thresholds', () => {
  const c = new Character('t','Tester','Role');
  c.awardXP(99);
  assert.strictEqual(c.lvl, 1);
  assert.strictEqual(c.xp, 99);
  c.awardXP(1);
  assert.strictEqual(c.lvl, 2);
  assert.strictEqual(c.xp, 0);
  assert.strictEqual(c.maxHp, 20);
  assert.strictEqual(c.skillPoints, 1);
});

test('scaleEnemy grows stats and HP per level', () => {
  const npc = {};
  scaleEnemy(npc, 4, ['STR']);
  assert.strictEqual(npc.maxHp, 40);
  assert.strictEqual(npc.hp, 40);
  assert.strictEqual(npc.lvl, 4);
  assert.strictEqual(npc.stats.STR, 7);
});
