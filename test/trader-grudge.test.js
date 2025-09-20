import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../scripts/core/trader.js', import.meta.url), 'utf8');
const context = { EventBus: { emit: () => {} }, Dustland: {}, globalThis: {} };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(code, context);
const Trader = context.Dustland.Trader;

test('grudge raises prices after cancellations', () => {
  const t = new Trader('t1', { markup: 1 });
  assert.strictEqual(t.price(10), 67);
  t.recordCancel();
  t.recordCancel();
  t.recordCancel();
  assert.strictEqual(t.grudge, 3);
  assert.strictEqual(t.price(10), 77);
  t.refresh();
  assert.strictEqual(t.grudge, 0);
  assert.strictEqual(t.price(10), 67);
});

test('tier and scarcity multipliers influence price', () => {
  const baseItem = { id: 'base', name: 'Base', type: 'weapon', mods: { ATK: 1 } };
  const basePrice = Trader.calculatePrice(baseItem, { markup: 1, grudge: 0 });
  const rarePrice = Trader.calculatePrice({ ...baseItem, rarity: 'rare' }, { markup: 1, grudge: 0 });
  const scarcePrice = Trader.calculatePrice(baseItem, { entry: { scarcity: 'scarce' }, markup: 1, grudge: 0 });
  assert.ok(rarePrice > basePrice);
  assert.ok(scarcePrice > basePrice);
  const annoyed = Trader.calculatePrice(baseItem, { markup: 1, grudge: 3 });
  assert.ok(annoyed > basePrice);
});
