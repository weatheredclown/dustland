import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const genCode = await fs.readFile(new URL('../scripts/core/item-generator.js', import.meta.url), 'utf8');
const cacheCode = await fs.readFile(new URL('../scripts/core/spoils-cache.js', import.meta.url), 'utf8');
const invCode = await fs.readFile(new URL('../scripts/core/inventory.js', import.meta.url), 'utf8');
global.EventBus = { emit(){} };
global.party = [{}];
vm.runInThisContext(genCode, { filename: 'core/item-generator.js' });
vm.runInThisContext(cacheCode, { filename: 'core/spoils-cache.js' });
vm.runInThisContext(invCode, { filename: 'core/inventory.js' });

test('spoils cache ranks are defined', () => {
  const ranks = Object.keys(SpoilsCache.ranks);
  assert.deepStrictEqual(ranks, ['rusted','sealed','armored','vaulted']);
});

test('create returns cache item', () => {
  const cache = SpoilsCache.create('rusted');
  assert.strictEqual(cache.type, 'spoils-cache');
  assert.strictEqual(cache.rank, 'rusted');
  assert.strictEqual(cache.name, 'Rusted Cache');
});

test('drop roll tied to challenge rating', () => {
  SpoilsCache.baseRate = 0.1;
  const fail = SpoilsCache.rollDrop(1, () => 0.2);
  assert.strictEqual(fail, null);
  const hit = SpoilsCache.rollDrop(5, () => 0.2);
  assert.ok(hit);
  assert.strictEqual(hit.type, 'spoils-cache');
});

test('pickRank tuned for challenge tiers', () => {
  assert.strictEqual(SpoilsCache.pickRank(7, () => 0.02), 'vaulted');
  assert.strictEqual(SpoilsCache.pickRank(7, () => 0.5), 'armored');
  assert.strictEqual(SpoilsCache.pickRank(7, () => 0.95), 'sealed');
  assert.strictEqual(SpoilsCache.pickRank(9, () => 0.05), 'vaulted');
  assert.strictEqual(SpoilsCache.pickRank(9, () => 0.95), 'armored');
});

test('tierWeights can be overridden for modding', () => {
  const orig = SpoilsCache.tierWeights;
  SpoilsCache.tierWeights = { 1: [['sealed', 1]] };
  assert.strictEqual(SpoilsCache.pickRank(1, () => 0.5), 'sealed');
  SpoilsCache.tierWeights = orig;
});

test('renderIcon creates element with rank class', () => {
  global.document = {
    createElement(tag){
      const el = {
        tagName: tag.toUpperCase(),
        className: '',
        classList: {
          add(cls){ el.className += (el.className ? ' ' : '') + cls; }
        },
        addEventListener(){},
        remove(){}
      };
      return el;
    }
  };
  const el = SpoilsCache.renderIcon('sealed');
  assert.ok(el.className.includes('cache-icon'));
  assert.ok(el.className.includes('sealed'));
  delete global.document;
});

test('open generates loot and removes one cache', () => {
  const loot = { id: 'loot', name: 'Test Loot', type: 'misc' };
  global.player = { inv: [SpoilsCache.create('sealed')] };
  global.notifyInventoryChanged = () => {};
  global.addToInv = it => { player.inv.push(it); return true; };
  ItemGen.generate = () => loot;
  const events = [];
  global.EventBus = { emit:(e,d)=>events.push({e,d}) };
  const out = SpoilsCache.open('sealed');
  assert.strictEqual(out, loot);
  assert.strictEqual(player.inv.length, 1);
  assert.strictEqual(events[0].e, 'spoils:opened');
  assert.strictEqual(events[0].d.item, loot);
  delete global.player;
  delete global.EventBus;
});

test('openAll opens caches and adds loot', () => {
  global.player = { inv: [SpoilsCache.create('sealed'), SpoilsCache.create('sealed'), {id:'x',type:'misc'}] };
  global.notifyInventoryChanged = () => {};
  const logs = [];
  global.log = m => logs.push(m);
  const drops = [{id:'a',name:'A',type:'misc'},{id:'b',name:'B',type:'misc'}];
  let i = 0;
  ItemGen.generate = () => drops[i++];
  global.addToInv = it => { player.inv.push(it); return true; };
  const opened = SpoilsCache.openAll('sealed');
  assert.strictEqual(opened, 2);
  assert.strictEqual(player.inv.length, 3);
  assert.ok(logs.some(m => m.includes('Opened 2')));
  delete global.player;
  delete global.log;
});

test('registering cache preserves rank for inventory', () => {
  global.player = { inv: [] };
  global.notifyInventoryChanged = () => {};
  global.EventBus = { emit(){} };
  registerItem(SpoilsCache.create('rusted'));
  addToInv(getItem('cache-rusted'));
  assert.strictEqual(player.inv[0].rank, 'rusted');
  ItemGen.generate = () => null;
  SpoilsCache.open('rusted');
  assert.strictEqual(player.inv.length, 0);
  delete global.player;
  delete global.EventBus;
});

test('openAll handles missing ItemGen gracefully', () => {
  delete global.ItemGen;
  global.player = { inv: [SpoilsCache.create('sealed')] };
  global.notifyInventoryChanged = () => {};
  const opened = SpoilsCache.openAll('sealed');
  assert.strictEqual(opened, 0);
  delete global.player;
});
