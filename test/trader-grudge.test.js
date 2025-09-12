import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../scripts/core/trader.js', import.meta.url), 'utf8');
const context = { EventBus: { emit: () => {} } };
vm.createContext(context);
vm.runInContext(code, context);
const Trader = context.Dustland.Trader;

test('grudge raises prices after cancellations', () => {
  const t = new Trader('t1', { markup: 1 });
  assert.strictEqual(t.price(10), 10);
  t.recordCancel();
  t.recordCancel();
  t.recordCancel();
  assert.strictEqual(t.grudge, 3);
  assert.strictEqual(t.price(10), 11);
  t.refresh();
  assert.strictEqual(t.grudge, 0);
  assert.strictEqual(t.price(10), 10);
});
