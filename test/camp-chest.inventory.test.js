import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const invCode = await fs.readFile(new URL('../scripts/core/inventory.js', import.meta.url), 'utf8');

const original = {
  EventBus: global.EventBus,
  Dustland: global.Dustland,
  player: global.player,
  party: global.party,
  log: global.log,
  toast: global.toast
};

const events = [];
global.EventBus = { emit: (evt, payload) => events.push({ evt, payload }) };
global.Dustland = global.Dustland || {};
global.player = { inv: [], campChest: [], campChestUnlocked: false };
global.party = { length: 1 };
global.log = () => {};
global.toast = () => {};

vm.runInThisContext(invCode, { filename: 'core/inventory.js' });

registerItem({ id: 'medkit', name: 'Medkit', type: 'supply', maxStack: 3 });
registerItem({ id: 'relic_blade', name: 'Relic Blade', type: 'weapon' });

test('storeCampChestItem requires unlocked chest', () => {
  player.inv = [getItem('medkit')];
  player.inv[0].count = 2;
  player.campChestUnlocked = false;
  const ok = storeCampChestItem(0);
  assert.equal(ok, false);
  assert.equal(player.inv.length, 1);
  assert.equal(player.campChest.length, 0);
});

test('storeCampChestItem splits stacks across chest slots', () => {
  events.length = 0;
  player.campChestUnlocked = true;
  player.campChest = [];
  const bundle = getItem('medkit');
  bundle.count = 5;
  bundle.maxStack = 3;
  player.inv = [bundle];
  const ok = storeCampChestItem(0);
  assert.equal(ok, true);
  assert.equal(player.inv.length, 0);
  assert.equal(player.campChest.length, 2);
  assert.deepEqual(player.campChest.map(it => it.count || 1), [3, 2]);
  assert.equal(events.some(e => e.evt === 'campChest:changed'), true);
});

test('withdrawCampChestItem merges stacks into inventory', () => {
  events.length = 0;
  player.inv = [];
  player.campChest = [
    { id: 'medkit', name: 'Medkit', type: 'supply', count: 3 },
    { id: 'medkit', name: 'Medkit', type: 'supply', count: 2 }
  ];
  const first = withdrawCampChestItem(0);
  assert.equal(first, true);
  assert.equal(player.inv.length, 1);
  assert.equal(player.inv[0].count, 3);
  assert.equal(player.campChest.length, 1);
  const second = withdrawCampChestItem(0);
  assert.equal(second, true);
  assert.equal(player.campChest.length, 0);
  assert.equal(player.inv.length, 1);
  assert.equal(player.inv[0].count, 5);
  assert.equal(events.filter(e => e.evt === 'campChest:changed').length >= 2, true);
});

test('non-stackable items retain identity when stored', () => {
  player.campChest = [];
  player.inv = [getItem('relic_blade')];
  const relic = player.inv[0];
  relic.signature = 'etched';
  const stored = storeCampChestItem(0);
  assert.equal(stored, true);
  assert.equal(player.inv.length, 0);
  assert.equal(player.campChest.length, 1);
  assert.equal(player.campChest[0].signature, 'etched');
  const withdrawn = withdrawCampChestItem(0);
  assert.equal(withdrawn, true);
  assert.equal(player.inv.length, 1);
  assert.equal(player.inv[0].signature, 'etched');
});

test('withdrawCampChestItem fails when inventory full', () => {
  const capacity = getPartyInventoryCapacity();
  player.inv = Array.from({ length: capacity }, (_, i) => ({ id: `junk_${i}` }));
  player.campChest = [{ id: 'medkit', name: 'Medkit', type: 'supply', count: 1 }];
  const messages = [];
  global.log = msg => messages.push(msg);
  const ok = withdrawCampChestItem(0);
  assert.equal(ok, false);
  assert.equal(player.campChest.length, 1);
  assert.ok(messages.includes('Inventory full.'));
  global.log = () => {};
});

test('unlockCampChest seeds medkits and emits change once', () => {
  events.length = 0;
  player.campChestUnlocked = false;
  player.campChest = [];
  const result = unlockCampChest();
  assert.equal(result, true);
  assert.equal(player.campChestUnlocked, true);
  assert.equal(events.some(e => e.evt === 'campChest:changed'), true);
  assert.equal(player.campChest.length > 0, true);
  const medkitCounts = player.campChest.map(it => Number.isFinite(it?.count) ? it.count : 1);
  const totalMedkits = medkitCounts.reduce((sum, qty) => sum + qty, 0);
  assert.equal(totalMedkits, 10);
  assert.equal(player.campChest.every(it => it?.id === 'medkit'), true);
  const snapshotCounts = [...medkitCounts];
  const snapshotIds = player.campChest.map(it => it?.id);
  events.length = 0;
  const repeat = unlockCampChest();
  assert.equal(repeat, true);
  assert.deepEqual(player.campChest.map(it => Number.isFinite(it?.count) ? it.count : 1), snapshotCounts);
  assert.deepEqual(player.campChest.map(it => it?.id), snapshotIds);
  assert.equal(events.length, 0);
});

test.after(() => {
  if (original.EventBus === undefined) delete global.EventBus; else global.EventBus = original.EventBus;
  if (original.Dustland === undefined) delete global.Dustland; else global.Dustland = original.Dustland;
  if (original.player === undefined) delete global.player; else global.player = original.player;
  if (original.party === undefined) delete global.party; else global.party = original.party;
  if (original.log === undefined) delete global.log; else global.log = original.log;
  if (original.toast === undefined) delete global.toast; else global.toast = original.toast;
});
