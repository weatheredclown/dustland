import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('trade UI shows timer and grudge', async () => {
  const dom = new JSDOM('<div id="shopTimer"></div><div id="shopGrudge"></div>');
  global.window = dom.window;
  global.document = dom.window.document;
  const code = await fs.readFile(new URL('../scripts/ui/trade.js', import.meta.url), 'utf8');
  vm.runInThisContext(code);
  Dustland.updateTradeUI({ refresh: 5, grudge: 2 });
  assert.strictEqual(document.getElementById('shopTimer').textContent, 'Refresh in 5h');
  assert.strictEqual(document.getElementById('shopGrudge').textContent, 'Grudge: 2');
});
