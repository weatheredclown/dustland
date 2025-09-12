import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../scripts/core/trader.js', import.meta.url), 'utf8');
const context = { EventBus:{ emit: () => {} } };
vm.createContext(context);
vm.runInContext(code, context);
const Trader = context.Dustland.Trader;

test('refresh cycles through waves', () => {
  const waves = [
    [{ id:'pipe_rifle' }],
    [{ id:'pulse_rifle' }],
    [{ id:'pulse_rifle' }, { id:'leather_jacket' }]
  ];
  const t = new Trader('t', { waves });
  assert.strictEqual(t.inventory[0].id, 'pipe_rifle');
  t.refresh();
  assert.strictEqual(t.inventory[0].id, 'pulse_rifle');
  t.refresh();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(t.inventory.map(i => i.id))), ['pulse_rifle', 'leather_jacket']);
  t.refresh();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(t.inventory.map(i => i.id))), ['pulse_rifle', 'leather_jacket']);
});
