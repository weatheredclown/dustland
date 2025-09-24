import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

function extractOpenShop(code) {
  const match = code.match(/function openShop\(npc\) {[\s\S]*?shopOverlay\.focus\(\);\r?\n}/);
  return match && match[0];
}

test('shop window height matches combat menu', async () => {
  const css = await fs.readFile(new URL('../dustland.css', import.meta.url), 'utf8');
  const combat = css.match(/#combatOverlay \.combat-window\s*{[^}]*height:\s*([^;]+);/);
  const shop = css.match(/\.shop-window\s*{[^}]*max-height:\s*([^;]+);/);
  assert.ok(combat && shop);
  const norm = s => s.replace(/\s+/g, '');
  assert.strictEqual(norm(shop[1]), norm(combat[1]));
});

test('arrow keys in shop do not move the player', async () => {
  const dom = new JSDOM('<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><div id="shopScrap"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.log = () => {};
  global.toast = () => {};
  global.CURRENCY = 's';
  global.player = { scrap: 10, inv: [] };
  global.getItem = id => ({ id, name: id, value: 1 });
  global.addToInv = () => true;
  global.removeFromInv = () => {};
  global.updateHUD = () => {};

  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const openShopCode = extractOpenShop(code);
  vm.runInThisContext(openShopCode);

  let moved = 0;
  window.addEventListener('keydown', () => { moved++; });

  openShop({ name: 'Shopkeep', shop: { inv: [] } });
  const shopOverlay = document.getElementById('shopOverlay');
  const evt = new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
  shopOverlay.dispatchEvent(evt);
  assert.strictEqual(moved, 0);
});

test('shop displays current scrap and updates after purchase', async () => {
  const dom = new JSDOM('<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><div id="shopScrap"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.log = () => {};
  global.toast = () => {};
  global.CURRENCY = 's';
  global.player = { scrap: 7, inv: [] };
  global.getItem = id => ({ id, name: id, value: 1 });
  global.addToInv = () => true;
  global.removeFromInv = () => {};
  global.updateHUD = () => {};

  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const openShopCode = extractOpenShop(code);
  vm.runInThisContext(openShopCode);

  openShop({ name: 'Shopkeep', shop: { inv: [ { id: 'potion' } ] } });
  const scrapEl = document.getElementById('shopScrap');
  assert.strictEqual(scrapEl.textContent, '7 s');
  const buyBtn = document.querySelector('#shopBuy .slot button');
  buyBtn.onclick();
  assert.strictEqual(scrapEl.textContent, '5 s');
});

test('shop stacks identical buy items with counters', async () => {
  const dom = new JSDOM('<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><div id="shopScrap"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.log = () => {};
  global.toast = () => {};
  global.CURRENCY = 's';
  global.player = { scrap: 50, inv: [] };
  global.getItem = id => {
    if (id === 'potion') return { id, name: 'Potion', value: 4, type: 'misc' };
    if (id === 'sword') return { id, name: 'Sword', value: 10, type: 'weapon' };
    return null;
  };
  global.addToInv = () => true;
  global.removeFromInv = () => {};
  global.updateHUD = () => {};

  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const openShopCode = extractOpenShop(code);
  vm.runInThisContext(openShopCode);

  openShop({
    name: 'Shopkeep',
    shop: {
      inv: [
        { id: 'potion', count: 2 },
        { id: 'potion' },
        { id: 'sword' },
        { id: 'sword' }
      ]
    }
  });

  const labels = Array.from(document.querySelectorAll('#shopBuy .slot span')).map(el => el.textContent);
  assert.deepStrictEqual(labels, ['Sword x2 - 20 s', 'Potion x3 - 8 s']);
});

test('shop sorts buy stacks by value high to low', async () => {
  const dom = new JSDOM('<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><div id="shopScrap"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.log = () => {};
  global.toast = () => {};
  global.CURRENCY = 's';
  global.player = { scrap: 50, inv: [] };
  const itemDefs = {
    axe: { id: 'axe', name: 'Axe', value: 5, type: 'weapon' },
    bronze: { id: 'bronze', name: 'Bronze Plate', value: 6, type: 'armor' },
    bandage: { id: 'bandage', name: 'Bandage', value: 3, type: 'misc' },
    medkit: { id: 'medkit', name: 'Medkit', value: 4, type: 'misc' }
  };
  global.getItem = id => itemDefs[id] ? { ...itemDefs[id] } : null;
  global.addToInv = () => true;
  global.removeFromInv = () => {};
  global.updateHUD = () => {};

  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const openShopCode = extractOpenShop(code);
  vm.runInThisContext(openShopCode);

  openShop({
    name: 'Shopkeep',
    shop: {
      inv: [
        { id: 'axe' },
        { id: 'medkit' },
        { id: 'bronze' },
        { id: 'bandage' }
      ]
    }
  });

  const labels = Array.from(document.querySelectorAll('#shopBuy .slot span')).map(el => el.textContent);
  assert.deepStrictEqual(labels, [
    'Bronze Plate x1 - 12 s',
    'Axe x1 - 10 s',
    'Medkit x1 - 8 s',
    'Bandage x1 - 6 s'
  ]);
});

test('shop stacks identical sell items and updates counts after selling', async () => {
  const dom = new JSDOM('<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><div id="shopScrap"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.log = () => {};
  global.toast = () => {};
  global.CURRENCY = 's';
  global.player = {
    scrap: 0,
    inv: [
      { id: 'potion', name: 'Potion', value: 6, type: 'misc', count: 3 },
      { id: 'sword', name: 'Sword', value: 10, type: 'weapon' },
      { id: 'sword', name: 'Sword', value: 10, type: 'weapon' }
    ]
  };
  global.getItem = id => {
    if (id === 'potion') return { id, name: 'Potion', value: 4, type: 'misc' };
    if (id === 'sword') return { id, name: 'Sword', value: 10, type: 'weapon' };
    return null;
  };
  global.addToInv = () => true;
  global.removeFromInv = idx => {
    const entry = global.player.inv[idx];
    if (!entry) return;
    const stackable = entry.type !== 'weapon' && entry.type !== 'armor' && entry.type !== 'trinket';
    const current = Math.max(1, Number.isFinite(entry.count) ? entry.count : 1);
    if (stackable && current > 1) {
      entry.count = current - 1;
    } else {
      global.player.inv.splice(idx, 1);
    }
  };
  global.updateHUD = () => {};

  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const openShopCode = extractOpenShop(code);
  vm.runInThisContext(openShopCode);

  openShop({ name: 'Shopkeep', shop: { inv: [] } });

  const initialLabels = Array.from(document.querySelectorAll('#shopSell .slot span')).map(el => el.textContent);
  assert.deepStrictEqual(initialLabels, ['Sword x2 - 5 s', 'Potion x3 - 3 s']);

  const sellButtons = Array.from(document.querySelectorAll('#shopSell .slot button'));
  sellButtons[0].onclick();
  const afterSwordLabels = Array.from(document.querySelectorAll('#shopSell .slot span')).map(el => el.textContent);
  assert.deepStrictEqual(afterSwordLabels, ['Sword x1 - 5 s', 'Potion x3 - 3 s']);

  const updatedSellButtons = Array.from(document.querySelectorAll('#shopSell .slot button'));
  updatedSellButtons[1].onclick();
  const afterPotionLabels = Array.from(document.querySelectorAll('#shopSell .slot span')).map(el => el.textContent);
  assert.deepStrictEqual(afterPotionLabels, ['Sword x1 - 5 s', 'Potion x2 - 3 s']);
});

test('shop sorts sell stacks by value high to low', async () => {
  const dom = new JSDOM('<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><div id="shopScrap"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.log = () => {};
  global.toast = () => {};
  global.CURRENCY = 's';
  global.player = {
    scrap: 0,
    inv: [
      { id: 'blade', name: 'Blade', value: 10, type: 'weapon' },
      { id: 'medkit', name: 'Medkit', value: 6, type: 'misc' },
      { id: 'vest', name: 'Vest', value: 8, type: 'armor' },
      { id: 'bandage', name: 'Bandage', value: 3, type: 'misc' },
      { id: 'axe', name: 'Axe', value: 9, type: 'weapon' }
    ]
  };
  global.getItem = id => ({ id, name: id, value: 1, type: 'misc' });
  global.addToInv = () => true;
  global.removeFromInv = () => {};
  global.updateHUD = () => {};

  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const openShopCode = extractOpenShop(code);
  vm.runInThisContext(openShopCode);

  openShop({ name: 'Shopkeep', shop: { inv: [] } });

  const labels = Array.from(document.querySelectorAll('#shopSell .slot span')).map(el => el.textContent);
  assert.deepStrictEqual(labels, [
    'Blade x1 - 5 s',
    'Vest x1 - 4 s',
    'Axe x1 - 4 s',
    'Medkit x1 - 3 s',
    'Bandage x1 - 1 s'
  ]);
});
