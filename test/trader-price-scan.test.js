import assert from 'node:assert';
import { test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectPricingData, formatReport } from '../scripts/supporting/trader-price-scan.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DUSTLAND_MODULE = path.join(REPO_ROOT, 'modules', 'dustland.module.js');

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
  assert.deepStrictEqual(ids, ['pipe_rifle', 'leather_jacket', 'water_flask', 'frag_grenade', 'incendiary_grenade']);
  const pipeRifle = trader.items.find(it => it.id === 'pipe_rifle');
  assert.ok(pipeRifle);
  assert.strictEqual(pipeRifle.price, 0);
  assert.ok(pipeRifle.needsValue);
});

test('formatReport emits readable summary', () => {
  const report = collectPricingData([DUSTLAND_MODULE], { repoRoot: REPO_ROOT });
  const text = formatReport(report);
  assert.ok(text.includes('Cass the Trader'));
  assert.ok(text.includes('pipe_rifle'));
  assert.ok(text.includes('Scrap: min 3'));
});
