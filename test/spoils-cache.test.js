import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../core/spoils-cache.js', import.meta.url), 'utf8');
vm.runInThisContext(code, { filename: 'core/spoils-cache.js' });

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
