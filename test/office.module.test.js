import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

function extractOpenShop(code) {
  const m = code.match(/function openShop\(npc\) {[\s\S]*?shopOverlay\.focus\(\);\r?\n}/);
  return m && m[0];
}

function readNormalized(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

test('office module boards castle and unboards via dialog', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  assert.match(
    src,
    /placeHut\(WORLD_MID \+ 3, WORLD_MIDY - 2, {\s*\n\s*interiorId: 'castle',\s*\n\s*boarded: true\s*\n\s*}\)/
  );
  assert.match(src, /start: [\s\S]*?effect: 'unboardDoor',\s*interiorId: 'castle'[\s\S]*?unlock:/);
  assert.match(src, /label: '\(Fight\)'/);
});

test('startGame preserves generated world when applying module', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  assert.match(src, /applyModule\(OFFICE_MODULE\)/);
});

test('office module places Boots of Speed near forest entry', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  assert.match(src, /id: 'boots_of_speed'/);
  assert.match(src, /x: 3,\s*y: WORLD_MIDY/);
  assert.match(src, /mods: \{ AGI: 5, move_delay_mod: 0\.5 \}/);
});

test('office module defines a powerful maze sword', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  assert.match(src, /id: 'maze_sword'/);
  assert.match(src, /mods: \{ ATK: 10 \}/);
});

test('office module uses object visuals for elevator and vending machine', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  assert.match(
    src,
    /const elevatorNPCs = \['floor1', 'floor2', 'floor3'\]\.map\(\(map\) => \({[\s\S]*?symbol: '\?',[\s\S]*?color: '#225a20'/
  );
  assert.match(
    src,
    /id: 'vending',[\s\S]*?symbol: '\?',[\s\S]*?color: '#225a20'/
  );
});

test('security guard persuasion can be retried', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  const guardRegex = /\{\s*id: 'security',[\s\S]*?\r?\n\s*\},\r?\n\s*\{\s*id: 'worker1'/;
  const match = src.match(guardRegex);
  assert(match);
  const objSrc = match[0].replace(/,\r?\n\s*\{\s*id: 'worker1'[\s\S]*/, '');
  assert.doesNotMatch(objSrc, /once:\s*true/);
});

test('startGame grants 10 scrap', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  const fnMatch = src.match(/startGame = function \(\) {[\s\S]*?};\n/);
  assert(fnMatch);
  global.player = { scrap: 0 };
  let hudCalled = false;
  global.refreshUI = () => { hudCalled = true; };
  global.applyModule = () => ({});
  global.registerItem = (it) => it;
  global.setPartyPos = () => {};
  global.setMap = () => {};
  global.log = () => {};
  global.itemDrops = [];
  global.interiors = {};
  global.OFFICE_MODULE = { worldGen: () => ({}), start: { x: 0, y: 0, map: 'floor1' }, postLoad: () => {} };
  vm.runInThisContext(fnMatch[0]);
  startGame();
  refreshUI();
  assert.equal(player.scrap, 10);
  assert(hudCalled);
});

test('office worker lends scrap when low and missing badge', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  const worker1Regex = /\{\s*id: 'worker1',[\s\S]*?\r?\n\s*\},\r?\n\s*\{\s*id: 'worker2'/;
  const match = src.match(worker1Regex);
  assert(match);
  const objSrc = match[0].replace(/,\r?\n\s*\{\s*id: 'worker2'.*/, '');
  let hudCalled = false;
  global.flagValue = () => 0;
  global.player = { scrap: 1 };
  global.updateHUD = () => { hudCalled = true; };
  global.portraits = { worker: '' };
  global.hasItem = () => false;
  vm.runInThisContext(
    readNormalized(path.join(__dirname, '..', 'scripts', 'core', 'actions.js'))
  );
  const worker = vm.runInThisContext('(' + objSrc + ')');
  const tree = worker.tree();
  const loanChoice = tree.start.choices.find((c) => c.label === 'Borrow 2 scrap');
  assert(loanChoice);
  globalThis.Dustland.actions.applyQuestReward(loanChoice.reward);
  assert.equal(player.scrap, 3);
  assert(hudCalled);
});

test('office worker hides loan if you have enough scrap', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  const worker1Regex = /\{\s*id: 'worker1',[\s\S]*?\r?\n\s*\},\r?\n\s*\{\s*id: 'worker2'/;
  const match = src.match(worker1Regex);
  assert(match);
  const objSrc = match[0].replace(/,\r?\n\s*\{\s*id: 'worker2'.*/, '');
  global.flagValue = () => 0;
  global.player = { scrap: 5 };
  global.updateHUD = () => {};
  global.portraits = { worker: '' };
  global.hasItem = () => false;
  const worker = vm.runInThisContext('(' + objSrc + ')');
  const tree = worker.tree();
  assert(!tree.start.choices.some((c) => c.label === 'Borrow 2 scrap'));
});

test('vending machine buys access card for scrap', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  const match = src.match(/\{\s*id: 'access_card'[\s\S]*?\}/);
  assert(match);
  const accessCard = vm.runInThisContext('(' + match[0] + ')');

  const dom = new JSDOM(
    '<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>'
  );
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.log = () => {};
  global.toast = () => {};
  global.CURRENCY = 's';
  global.player = { scrap: 0, inv: [accessCard] };
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
  global.updateHUD = () => {};
  global.addToInv = () => true;
  global.getItem = () => accessCard;

  const eng = readNormalized(path.join(__dirname, '..', 'scripts', 'dustland-engine.js'));
  const openShopCode = extractOpenShop(eng);
  vm.runInThisContext(openShopCode);

  openShop({ name: 'Vend-O', vending: true, shop: { inv: [] } });
  const sellBtn = document.querySelector('#shopSell .slot button');
  assert(sellBtn);
  sellBtn.onclick();
  assert.strictEqual(player.scrap, accessCard.value);
  assert.strictEqual(player.inv.length, 0);
});

test('vending machine sells Dusty Candy Bar', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  const npcMatch = src.match(/id:\s*'vending',[\s\S]*?shop:\s*\{\s*inv:\s*\[\s*\{\s*id:\s*'dusty_candy'\s*\}\s*\]\s*\}/);
  assert(npcMatch);
  const vending = { name: 'Vending Machine', vending: true, shop: { inv: [ { id: 'dusty_candy' } ] } };
  const itemMatch = src.match(/\{ id: 'dusty_candy',[\s\S]*?\}\s*\},/);
  assert(itemMatch);
  const candy = vm.runInThisContext('(' + itemMatch[0].slice(0, -1) + ')');

  const dom = new JSDOM(
    '<div id="shopOverlay"><div class="shop-window"><header><div id="shopName"></div><button id="closeShopBtn"></button></header><div class="shop-panels"><div id="shopBuy" class="slot-list"></div><div id="shopSell" class="slot-list"></div></div></div></div>'
  );
  global.window = dom.window;
  global.document = dom.window.document;
  global.requestAnimationFrame = () => {};
  global.CURRENCY = 's';
  global.player = { scrap: 10, inv: [] };
  global.addToInv = () => true;
  global.removeFromInv = () => {};
  global.updateHUD = () => {};
  global.getItem = (id) => (id === candy.id ? candy : null);
  const eng = readNormalized(path.join(__dirname, '..', 'scripts', 'dustland-engine.js'));
  const openShopCode = extractOpenShop(eng);
  vm.runInThisContext(openShopCode);
  openShop(vending);
  const buySpan = document.querySelector('#shopBuy .slot span');
  assert(buySpan && buySpan.textContent.includes('Dusty Candy Bar'));
});

test('office worker hides loan if you still have your badge', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = readNormalized(file);
  const worker1Regex = /\{\s*id: 'worker1',[\s\S]*?\r?\n\s*\},\r?\n\s*\{\s*id: 'worker2'/;
  const match = src.match(worker1Regex);
  assert(match);
  const objSrc = match[0].replace(/,\r?\n\s*\{\s*id: 'worker2'.*/, '');
  global.flagValue = () => 0;
  global.player = { scrap: 1 };
  global.updateHUD = () => {};
  global.portraits = { worker: '' };
  global.hasItem = (id) => id === 'access_card';
  const worker = vm.runInThisContext('(' + objSrc + ')');
  const tree = worker.tree();
  assert(!tree.start.choices.some((c) => c.label === 'Borrow 2 scrap'));
});
