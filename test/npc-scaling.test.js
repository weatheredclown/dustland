import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('NPC Scaling', async () => {
  const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInThisContext(partyCode, { filename: '../scripts/core/party.js' });

  const presetsCode = await fs.readFile(new URL('../scripts/core/presets.js', import.meta.url), 'utf8');
  vm.runInThisContext(presetsCode, { filename: '../scripts/core/presets.js' });

  const npcCode = await fs.readFile(new URL('../scripts/core/npc.js', import.meta.url), 'utf8');
  vm.runInThisContext(npcCode, { filename: '../scripts/core/npc.js' });


  const { scaleEnemy, scaleEnemyWithPreset } = globalThis;

  await test('scaleEnemy applies level-based scaling', () => {
    const npc = {};
    scaleEnemy(npc, 3, ['STR', 'AGI']);
    assert.strictEqual(npc.maxHp, 30);
    assert.strictEqual(npc.hp, 30);
    assert.strictEqual(npc.lvl, 3);
    assert.strictEqual(npc.stats.STR, 5);
    assert.strictEqual(npc.stats.AGI, 5);
    assert.strictEqual(npc.stats.INT, 4);
  });

  await test('scaleEnemyWithPreset uses named build', () => {
    const npc = {};
    scaleEnemyWithPreset(npc, 3, 'Scrapper');
    assert.strictEqual(npc.stats.STR, 5);
    assert.strictEqual(npc.stats.AGI, 5);
  });
});
