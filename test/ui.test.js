import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('ui module emits DOM updates via events', async () => {
  const dom = new JSDOM('<div id="box" style="display:none"></div><input id="field" />');
  const context = { window: dom.window, document: dom.window.document, console };
  vm.createContext(context);
  const busCode = await fs.readFile(new URL('../event-bus.js', import.meta.url), 'utf8');
  vm.runInContext(busCode, context);
  const uiCode = await fs.readFile(new URL('../ui.js', import.meta.url), 'utf8');
  vm.runInContext(uiCode, context);
  context.Dustland.ui.show('box', 'flex');
  assert.strictEqual(dom.window.document.getElementById('box').style.display, 'flex');
  context.Dustland.ui.hide('box');
  assert.strictEqual(dom.window.document.getElementById('box').style.display, 'none');
  context.Dustland.ui.setValue('field', 'hi');
  assert.strictEqual(dom.window.document.getElementById('field').value, 'hi');
});
