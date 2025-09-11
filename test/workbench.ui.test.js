import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import vm from 'node:vm';

async function loadWorkbench(dom){
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.EventBus = { emit: () => {} };
  global.log = () => {};
  const code = await fs.readFile(new URL('../scripts/workbench.js', import.meta.url), 'utf8');
  vm.runInThisContext(code);
}

test('workbench lists missing requirements for recipes you lack', async () => {
  const dom = new JSDOM('<div id="workbenchOverlay"><div class="workbench-window"><header><button id="closeWorkbenchBtn"></button></header><div id="workbenchRecipes"></div></div></div>');
  await loadWorkbench(dom);
  global.player = { scrap: 0, fuel: 0, inv: [] };
  global.hasItem = id => player.inv.some(i => i.id === id);
  global.findItemIndex = id => player.inv.findIndex(i => i.id === id);
  global.removeFromInv = idx => player.inv.splice(idx, 1);
  global.addToInv = id => { player.inv.push({ id }); return true; };

  Dustland.openWorkbench();
  const rows = dom.window.document.querySelectorAll('#workbenchRecipes .slot');
  assert.strictEqual(rows.length, 3);
  assert.match(rows[0].textContent, /need 5 scrap, 50 fuel/i);
  assert.match(rows[1].textContent, /need 3 scrap, cloth/i);
  assert.match(rows[2].textContent, /need plant fiber/i);
});

test('arrow keys in workbench do not bubble to window', async () => {
  const dom = new JSDOM('<div id="workbenchOverlay"><div class="workbench-window"><header><button id="closeWorkbenchBtn"></button></header><div id="workbenchRecipes"></div></div></div>');
  await loadWorkbench(dom);
  global.player = { scrap: 5, fuel: 50, inv: [ { id: 'cloth' }, { id: 'plant_fiber' } ] };
  global.hasItem = id => player.inv.some(i => i.id === id);
  global.findItemIndex = id => player.inv.findIndex(i => i.id === id);
  global.removeFromInv = idx => player.inv.splice(idx, 1);
  global.addToInv = id => { player.inv.push({ id }); return true; };

  let moved = 0;
  dom.window.addEventListener('keydown', () => { moved++; });
  Dustland.openWorkbench();
  const overlay = dom.window.document.getElementById('workbenchOverlay');
  const evt = new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
  overlay.dispatchEvent(evt);
  assert.strictEqual(moved, 0);
  const buttons = dom.window.document.querySelectorAll('#workbenchRecipes .slot button');
  assert.strictEqual(buttons.length, 3);
});
