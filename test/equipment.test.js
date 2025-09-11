import assert from 'node:assert';
import { test } from 'node:test';

// Minimal stubs for globals used by core modules
globalThis.EventBus = { emit() {} };
globalThis.log = () => {};
globalThis.toast = () => {};
globalThis.player = { inv: [] };

await import('../scripts/core/inventory.js');
await import('../scripts/core/party.js');
await import('../scripts/core/equipment.js');

test('base equipment items are registered', () => {
  const sword = getItem('pipe_blade');
  assert.ok(sword, 'pipe_blade registered');
  assert.strictEqual(sword.mods.ATK, 2);
  assert.strictEqual(sword.mods.ADR, 12);
  const armor = getItem('leather_jacket');
  assert.ok(armor, 'leather_jacket registered');
  assert.strictEqual(armor.mods.DEF, 1);
});

test('equipment modifiers apply to characters', () => {
  const c = new Character('id', 'Hero', 'fighter');
  c.equip.weapon = getItem('pipe_blade');
  c.equip.armor = getItem('juggernaut_plate');
  c.applyEquipmentStats();
  assert.strictEqual(c._bonus.ATK, 2);
  assert.strictEqual(c._bonus.DEF, 3);
});

test('adrenaline modifiers are applied', () => {
  const c = new Character('id2', 'Scout', 'scout');
  c.equip.armor = getItem('scavenger_rig');
  c.applyCombatMods();
  assert.strictEqual(c.adrGenMod, 1.1);
});

test('adrenaline damage modifiers are applied', () => {
  const c = new Character('id3', 'Brawler', 'brawler');
  c.equip.weapon = getItem('stun_baton');
  c.applyCombatMods();
  assert.strictEqual(c.adrDmgMod, 1.2);
});

test('equipping item toasts stat changes', () => {
  const prevToast = globalThis.toast;
  const msgs = [];
  globalThis.toast = msg => msgs.push(msg);
  party.length = 0;
  const m = new Character('id4', 'Hero', 'fighter');
  party.push(m);
  registerItem({ id: 'stat_hat', name: 'Stat Hat', type: 'armor', mods: { STR: 3, AGI: -1 } });
  player.inv = [getItem('stat_hat')];
  equipItem(0, 0);
  assert.strictEqual(msgs[1], '+3 STR, -1 AGI');
  globalThis.toast = prevToast;
});
