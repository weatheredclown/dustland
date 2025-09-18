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
  global.closeDialog = () => {};
  const wbCode = await fs.readFile(new URL('../scripts/workbench.js', import.meta.url), 'utf8');
  vm.runInThisContext(wbCode);
  if (typeof NPC === 'undefined') {
    const npcCode = await fs.readFile(new URL('../scripts/core/npc.js', import.meta.url), 'utf8');
    vm.runInThisContext(npcCode);
  }
  global.openDialog = (npc, node='start') => npc.processNode(node);
}

function useWorkbench(){
  const npc = new NPC({
    id: 'bench',
    map: 'world',
    x: 0,
    y: 0,
    color: '#fff',
    name: 'Workbench',
    title: '',
    desc: '',
    tree: { start: { text: '', choices: [{ label: '(Leave)', to: 'bye' }] } },
    workbench: true
  });
  openDialog(npc);
}

test('workbench shows requirement counts for recipes you lack', async () => {
  const dom = new JSDOM('<div id="workbenchOverlay"><div class="workbench-window"><header><button id="closeWorkbenchBtn"></button></header><div id="workbenchRecipes"></div></div></div>');
  await loadWorkbench(dom);
  global.player = { scrap: 0, fuel: 0, inv: [] };
  global.hasItem = id => player.inv.some(i => i.id === id);
  global.findItemIndex = id => player.inv.findIndex(i => i.id === id);
  global.removeFromInv = (idx, qty = 1) => {
    const item = player.inv[idx];
    if (!item) return;
    const count = Number.isFinite(item?.count) ? item.count : 1;
    if (count > qty) {
      item.count = count - qty;
    } else {
      player.inv.splice(idx, 1);
    }
  };
  global.addToInv = id => { player.inv.push({ id }); return true; };
  global.countItems = id => player.inv.reduce((sum, it) => sum + (it.id === id ? Math.max(1, Number.isFinite(it?.count) ? it.count : 1) : 0), 0);

  useWorkbench();
  const rows = dom.window.document.querySelectorAll('#workbenchRecipes .slot');
  assert.strictEqual(rows.length, 4);
  assert.match(rows[0].textContent, /Scrap: 0\/5/i);
  assert.match(rows[0].textContent, /Fuel: 0\/50/i);
  assert.match(rows[1].textContent, /Scrap: 0\/3/i);
  assert.match(rows[1].textContent, /Cloth: 0\/1/i);
  assert.match(rows[2].textContent, /Plant Fiber: 0\/1/i);
  assert.match(rows[3].textContent, /Plant Fiber: 0\/1/i);
  assert.match(rows[3].textContent, /Water Flask: 0\/1/i);
  const buttons = dom.window.document.querySelectorAll('#workbenchRecipes .slot button');
  assert.strictEqual(buttons.length, 0);
});

test('arrow keys in workbench do not bubble to window', async () => {
  const dom = new JSDOM('<div id="workbenchOverlay"><div class="workbench-window"><header><button id="closeWorkbenchBtn"></button></header><div id="workbenchRecipes"></div></div></div>');
  await loadWorkbench(dom);
  global.player = { scrap: 5, fuel: 50, inv: [ { id: 'cloth' }, { id: 'plant_fiber' }, { id: 'water_flask' } ] };
  global.hasItem = id => player.inv.some(i => i.id === id);
  global.findItemIndex = id => player.inv.findIndex(i => i.id === id);
  global.removeFromInv = (idx, qty = 1) => {
    const item = player.inv[idx];
    if (!item) return;
    const count = Number.isFinite(item?.count) ? item.count : 1;
    if (count > qty) {
      item.count = count - qty;
    } else {
      player.inv.splice(idx, 1);
    }
  };
  global.addToInv = id => { player.inv.push({ id }); return true; };
  global.countItems = id => player.inv.reduce((sum, it) => sum + (it.id === id ? Math.max(1, Number.isFinite(it?.count) ? it.count : 1) : 0), 0);

  let moved = 0;
  dom.window.addEventListener('keydown', () => { moved++; });
  useWorkbench();
  const overlay = dom.window.document.getElementById('workbenchOverlay');
  const evt = new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
  overlay.dispatchEvent(evt);
  assert.strictEqual(moved, 0);
  const buttons = dom.window.document.querySelectorAll('#workbenchRecipes .slot button');
  assert.strictEqual(buttons.length, 4);
});

test('clicking craft adds item to inventory', async () => {
  const dom = new JSDOM('<div id="workbenchOverlay"><div class="workbench-window"><header><button id="closeWorkbenchBtn"></button></header><div id="workbenchRecipes"></div></div></div>');
  await loadWorkbench(dom);
  global.player = { scrap: 5, fuel: 50, inv: [ { id: 'cloth' }, { id: 'plant_fiber' } ] };
  global.hasItem = id => player.inv.some(i => i.id === id);
  global.findItemIndex = id => player.inv.findIndex(i => i.id === id);
  global.removeFromInv = idx => player.inv.splice(idx, 1);
  global.addToInv = id => { player.inv.push({ id }); return true; };
  global.countItems = id => player.inv.filter(i => i.id === id).length;

  useWorkbench();
  let buttons = dom.window.document.querySelectorAll('#workbenchRecipes .slot button');
  assert.strictEqual(buttons.length, 3);
  buttons[2].click();
  assert.ok(player.inv.some(i => i.id === 'bandage'));
  assert.ok(!player.inv.some(i => i.id === 'plant_fiber'));
  buttons = dom.window.document.querySelectorAll('#workbenchRecipes .slot button');
  assert.strictEqual(buttons.length, 2);
});
