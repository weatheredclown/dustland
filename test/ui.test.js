import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('ui module emits DOM updates via events', async () => {
  const document = makeDocument();
  document.getElementById('box').style.display = 'none';
  document.getElementById('field');
  const context = { window: { document }, document, console };
  vm.createContext(context);
  const busCode = await fs.readFile(new URL('../scripts/event-bus.js', import.meta.url), 'utf8');
  vm.runInContext(busCode, context);
  const uiCode = await fs.readFile(new URL('../scripts/ui.js', import.meta.url), 'utf8');
  vm.runInContext(uiCode, context);
  context.Dustland.ui.show('box', 'flex');
  assert.strictEqual(document.getElementById('box').style.display, 'flex');
  context.Dustland.ui.hide('box');
  assert.strictEqual(document.getElementById('box').style.display, 'none');
  context.Dustland.ui.setValue('field', 'hi');
  assert.strictEqual(document.getElementById('field').value, 'hi');
});
