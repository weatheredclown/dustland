import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../core/item-generator.js', import.meta.url), 'utf8');
vm.runInThisContext(code, { filename: 'core/item-generator.js' });

test('generator creates item with type, name, and stats', () => {
  const vals = [0,0,0,0];
  const rng = () => vals.shift() ?? 0;
  const item = ItemGen.generate('sealed', rng);
  assert.ok(item.id);
  assert.strictEqual(item.type, 'weapon');
  assert.strictEqual(item.name, 'Grit-Stitched Repeater');
  assert.strictEqual(item.rank, 'sealed');
  assert.ok(item.stats.power >= 3 && item.stats.power <= 5);
  assert.strictEqual(item.scrap, ItemGen.calcScrap(item));
});

test('generated items have unique ids', () => {
  const a = ItemGen.generate('rusted', () => 0);
  const b = ItemGen.generate('rusted', () => 0);
  assert.notStrictEqual(a.id, b.id);
});

test('higher rank yields higher power', () => {
  const rusted = ItemGen.generate('rusted', () => 0.99);
  const armored = ItemGen.generate('armored', () => 0);
  assert.ok(armored.stats.power > rusted.stats.power);
});

test('pools and stat tables populated', () => {
  assert.ok(ItemGen.adjectives.includes('Solar-Forged'));
  assert.ok(ItemGen.nouns.includes('Harmonica'));
  assert.deepStrictEqual(ItemGen.statRanges.vaulted, { min: 10, max: 15 });
});

test('generate uses updated tables', () => {
  const item = ItemGen.generate('armored', () => 0.5);
  assert.strictEqual(item.name, 'Scrap-Bound Injector');
  assert.strictEqual(item.stats.power, 9);
  assert.strictEqual(item.scrap, 5);
});

test('oddity items include lore snippet', () => {
  const vals = [0.95,0,0,0];
  const rng = () => vals.shift() ?? 0;
  const item = ItemGen.generate('rusted', rng);
  assert.strictEqual(item.type, 'oddity');
  assert.ok(ItemGen.oddityLore.includes(item.lore));
});

test('scrap value accounts for stats and mods', () => {
  const item = { stats: { power: 4, speed: 2 }, mods: { DEF: 3 } };
  const expected = Math.round((4 + 2 + 3) / 2);
  assert.strictEqual(ItemGen.calcScrap(item), expected);
});
