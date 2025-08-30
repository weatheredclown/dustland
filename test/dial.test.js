import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('dial widget increments and clamps', async () => {
  const document = makeDocument();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const context = { window: { document }, document };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../components/dial.js', import.meta.url), 'utf8');
  vm.runInContext(code, context);
  const dial = context.Dustland.DialWidget(container, { min: 0, max: 5, value: 2 });
  dial.inc();
  assert.strictEqual(dial.value(), 3);
  dial.dec();
  dial.dec();
  assert.strictEqual(dial.value(), 1);
  dial.set(10);
  assert.strictEqual(dial.value(), 5);
});
