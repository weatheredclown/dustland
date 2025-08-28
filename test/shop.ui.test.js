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
  const dom = new JSDOM('<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>');
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
