import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const invCode = await fs.readFile(new URL('../scripts/core/inventory.js', import.meta.url), 'utf8');

const orig = { EventBus: global.EventBus, player: global.player, party: global.party, log: global.log, toast: global.toast };
global.EventBus = { emit(){} };
global.player = { inv: [] };
global.party = { map:'world', x:0, y:0, length:1 };
global.log = () => {};
global.toast = () => {};
vm.runInThisContext(invCode, { filename: 'core/inventory.js' });

registerItem({ id:'a', name:'A', type:'misc' });
registerItem({ id:'b', name:'B', type:'misc' });

for (const key of Object.keys(itemDrops)) { delete itemDrops[key]; }
itemDrops.length = 0;

test('dropItems creates cache', () => {
  player.inv = [getItem('a'), getItem('b')];
  const dropped = dropItems([0,1]);
  assert.strictEqual(dropped, 2);
  assert.strictEqual(player.inv.length, 0);
  assert.strictEqual(itemDrops.length, 1);
  assert.deepStrictEqual(itemDrops[0].items, ['a','b']);
  itemDrops.length = 0;
});

test('pickupCache restores items when space available', () => {
  player.inv = [];
  const ok = pickupCache({ items:['a','b'], map:'world', x:0, y:0 });
  assert.ok(ok);
  assert.strictEqual(player.inv.length, 2);
});

test('pickupCache fails if inventory full', () => {
  player.inv = Array.from({length:getPartyInventoryCapacity()}, (_,i)=>({id:'x'+i}));
  const ok = pickupCache({ items:['a'] });
  assert.strictEqual(ok, false);
  assert.strictEqual(player.inv.length, getPartyInventoryCapacity());
});

test('tryAutoPickup collects loot drops when inventory has room', () => {
  player.inv = [];
  itemDrops.length = 0;
  const drop = { id: 'a', map: 'world', x: 0, y: 0, dropType: 'loot' };
  itemDrops.push(drop);
  const ok = tryAutoPickup(drop);
  assert.ok(ok);
  assert.strictEqual(player.inv.length, 1);
  assert.strictEqual(itemDrops.length, 0);
});

test('tryAutoPickup collects loot caches when capacity allows', () => {
  player.inv = [];
  itemDrops.length = 0;
  const drop = { items: ['a', 'b'], map: 'world', x: 0, y: 0, dropType: 'loot' };
  const ok = tryAutoPickup(drop);
  assert.ok(ok);
  assert.strictEqual(player.inv.length, 2);
  assert.strictEqual(itemDrops.length, 0);
});

test('tryAutoPickup leaves loot on the ground when inventory is full', () => {
  player.inv = Array.from({ length: getPartyInventoryCapacity() }, (_, i) => ({ id: 'full' + i }));
  itemDrops.length = 0;
  const drop = { id: 'a', map: 'world', x: 0, y: 0, dropType: 'loot' };
  itemDrops.push(drop);
  const ok = tryAutoPickup(drop);
  assert.strictEqual(ok, false);
  assert.strictEqual(itemDrops.length, 1);
  assert.strictEqual(player.inv.length, getPartyInventoryCapacity());
});

test.after(() => {
  if(orig.EventBus === undefined) delete global.EventBus; else global.EventBus = orig.EventBus;
  if(orig.player === undefined) delete global.player; else global.player = orig.player;
  if(orig.party === undefined) delete global.party; else global.party = orig.party;
  if(orig.log === undefined) delete global.log; else global.log = orig.log;
  if(orig.toast === undefined) delete global.toast; else global.toast = orig.toast;
});
