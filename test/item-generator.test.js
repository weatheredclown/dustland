import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../scripts/core/item-generator.js', import.meta.url), 'utf8');
vm.runInThisContext(code, { filename: 'core/item-generator.js' });

test('generator creates trinket with stat boost', () => {
  const vals = [0,0,0,0];
  const rng = () => vals.shift() ?? 0;
  const item = ItemGen.generate('sealed', rng);
  assert.ok(item.id);
  assert.strictEqual(item.type, 'trinket');
  assert.strictEqual(item.name, 'Grit-Stitched Repeater');
  assert.strictEqual(item.rank, 'sealed');
  assert.strictEqual(item.mods.STR, 4);
  assert.strictEqual(item.scrap, ItemGen.calcScrap(item));
});

test('generated items have unique ids', () => {
  const a = ItemGen.generate('rusted', () => 0);
  const b = ItemGen.generate('rusted', () => 0);
  assert.notStrictEqual(a.id, b.id);
});

test('higher rank yields higher boost', () => {
  const rusted = ItemGen.generate('rusted', () => 0.99);
  const armored = ItemGen.generate('armored', () => 0);
  const rustedBoost = Object.values(rusted.mods)[0];
  const armoredBoost = Object.values(armored.mods)[0];
  assert.ok(armoredBoost > rustedBoost);
});

test('pools and stat tables populated', () => {
  assert.ok(ItemGen.adjectives.includes('Solar-Forged'));
  assert.ok(ItemGen.nouns.includes('Harmonica'));
  assert.deepStrictEqual(ItemGen.statRanges.vaulted, { min: 10, max: 15 });
});

test('generate uses updated tables', () => {
  const item = ItemGen.generate('armored', () => 0.5);
  assert.strictEqual(item.name, 'Scrap-Bound Injector');
  assert.strictEqual(item.mods.PER, 9);
  assert.strictEqual(item.scrap, ItemGen.calcScrap(item));
});
