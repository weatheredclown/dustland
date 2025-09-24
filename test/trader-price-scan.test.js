import assert from 'node:assert';
import fs from 'node:fs';
import { test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readModule } from '../scripts/module-tools/utils.js';
import { collectPricingData, formatReport } from '../scripts/supporting/trader-price-scan.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DUSTLAND_MODULE = path.join(REPO_ROOT, 'modules', 'dustland.module.js');
const DUSTLAND_JSON = path.join(REPO_ROOT, 'data', 'modules', 'dustland.json');

test('collectPricingData summarizes dustland traders and scrap', () => {
  const report = collectPricingData([DUSTLAND_MODULE], { repoRoot: REPO_ROOT });
  assert.strictEqual(report.modules.length, 1);
  const moduleReport = report.modules[0];
  assert.strictEqual(moduleReport.name, 'dustland-module');
  assert.ok(moduleReport.scrapSummary.count > 0);
  assert.strictEqual(moduleReport.scrapSummary.min, 3);
  assert.strictEqual(moduleReport.scrapSummary.max, 5);
  const trader = moduleReport.vendors.find(v => v.name === 'Cass the Trader');
  assert.ok(trader);
  const ids = trader.items.map(it => it.id);
  assert.deepStrictEqual(ids, [
    'pipe_rifle',
    'leather_jacket',
    'water_flask',
    'frag_grenade',
    'incendiary_grenade',
    'minigun'
  ]);
  const pipeRifle = trader.items.find(it => it.id === 'pipe_rifle');
  assert.ok(pipeRifle);
  assert.strictEqual(pipeRifle.price, 232);
  assert.ok(pipeRifle.needsValue);
  const minigun = trader.items.find(it => it.id === 'minigun');
  assert.ok(minigun);
  assert.strictEqual(minigun.price, 10000);
  assert.ok(!minigun.needsValue);

  let moduleData;
  try {
    moduleData = JSON.parse(fs.readFileSync(DUSTLAND_JSON, 'utf8'));
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err;
    moduleData = readModule(DUSTLAND_MODULE).data;
  }
  const cass = moduleData.npcs.find(npc => npc.id === 'trader');
  assert.ok(cass, 'Cass the Trader definition missing');
  assert.strictEqual(cass.shop.refresh, 24);
  cass.shop.inv.forEach(entry => {
    assert.ok(entry.rarity, `Missing rarity on ${entry.id}`);
    assert.ok(entry.cadence, `Missing cadence on ${entry.id}`);
    if (entry.cadence === 'weekly') {
      assert.strictEqual(entry.refreshHours, 168);
      assert.ok(
        entry.rarity === 'rare' ||
        entry.rarity === 'epic' ||
        entry.rarity === 'legendary'
      );
    } else {
      assert.strictEqual(entry.refreshHours, 24);
    }
  });
});

test('formatReport emits readable summary', () => {
  const report = collectPricingData([DUSTLAND_MODULE], { repoRoot: REPO_ROOT });
  const text = formatReport(report);
  assert.ok(text.includes('Cass the Trader'));
  assert.ok(text.includes('pipe_rifle'));
  assert.ok(text.includes('minigun'));
  assert.ok(text.includes('Scrap: min 3'));
});
