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

// --- Distribution & odds tests ---
function makeRNG(seed = 2463534242) {
  let x = seed >>> 0;
  return function rng() {
    // xorshift32
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17; x >>>= 0;
    x ^= x << 5;  x >>>= 0;
    return x / 0x100000000;
  };
}

test('drop odds scale with challenge (empirical)', () => {
  const origRate = SpoilsCache.baseRate;
  const origPick = SpoilsCache.pickRank;
  SpoilsCache.baseRate = 0.02; // keep under 1.0 across tested challenges
  const trials = 10000;

  const hitRate = (challenge, seed) => {
    const rng = makeRNG(seed);
    // Ensure rollDrop consumes exactly one RNG per trial by fixing pickRank
    SpoilsCache.pickRank = () => 'sealed';
    let hits = 0;
    for (let i = 0; i < trials; i++) {
      const res = SpoilsCache.rollDrop(challenge, rng);
      if (res) hits++;
    }
    return hits / trials;
  };

  const rLow = hitRate(2, 42);   // expected ~ 0.04
  const rHigh = hitRate(10, 1337); // expected ~ 0.20

  assert.ok(rLow > 0.02 && rLow < 0.06, `low challenge rate out of bounds: ${rLow}`);
  assert.ok(rHigh > 0.15 && rHigh < 0.25, `high challenge rate out of bounds: ${rHigh}`);

  SpoilsCache.baseRate = origRate;
  SpoilsCache.pickRank = origPick;
});

test('tier distribution roughly matches weights by challenge', () => {
  const trials = 20000;
  const approx = (val, exp, tol = 0.015) => {
    const diff = Math.abs(val - exp);
    assert.ok(diff <= tol, `expected ~${exp}, got ${val} (diff ${diff})`);
  };

  // Challenge 7 expects: vaulted 0.03, armored 0.87, sealed 0.10
  {
    const rng = makeRNG(7);
    const counts = { vaulted: 0, armored: 0, sealed: 0, rusted: 0 };
    for (let i = 0; i < trials; i++) {
      const r = SpoilsCache.pickRank(7, rng);
      counts[r]++;
    }
    const p = {
      vaulted: counts.vaulted / trials,
      armored: counts.armored / trials,
      sealed: counts.sealed / trials
    };
    approx(p.vaulted, 0.03);
    approx(p.armored, 0.87);
    approx(p.sealed, 0.10);
  }

  // Challenge 9 expects: vaulted 0.2, armored 0.8
  {
    const rng = makeRNG(9);
    const counts = { vaulted: 0, armored: 0 };
    for (let i = 0; i < trials; i++) {
      const r = SpoilsCache.pickRank(9, rng);
      counts[r]++;
    }
    const p = {
      vaulted: counts.vaulted / trials,
      armored: counts.armored / trials
    };
    approx(p.vaulted, 0.2, 0.02);
    approx(p.armored, 0.8, 0.02);
  }
});
