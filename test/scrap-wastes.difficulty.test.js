import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('scrap wastes has challenge mix', async () => {
  const code = await fs.readFile(new URL('../scripts/supporting/zone-scrap-wastes.js', import.meta.url), 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  const zone = context.scrapWastesZone;
  const normals = zone.enemies.filter(e => !e.challenge);
  const challenges = zone.enemies.filter(e => e.challenge);
  assert.ok(normals.length >= 5 && normals.length <= 7);
  assert.ok(challenges.length >= 1);
});
