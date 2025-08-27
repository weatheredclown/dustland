import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

function setup(items, equipped){
  const dom = new JSDOM('<div id="inv"></div>');
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    player: { inv: items },
    party: [{ equip: equipped }],
    selectedMember: 0,
    SpoilsCache: { renderIcon: () => null, open: () => {}, openAll: () => {} },
    equipItem: () => {},
    useItem: () => {},
    CURRENCY: ''
  };
  vm.createContext(ctx);
  return ctx;
}

async function loadRender(ctx){
  const full = await fs.readFile(new URL('../dustland-engine.js', import.meta.url), 'utf8');
  const start = full.indexOf('function calcItemValue');
  const end = full.indexOf('function renderQuests');
  vm.runInContext(full.slice(start, end), ctx);
}

test('better items are highlighted', async () => {
  const items = [
    { name: 'Shiny Blade', slot: 'weapon', value: 3, mods: { ATK: 2 } },
    { name: 'Old Stick', slot: 'weapon', value: 1, mods: { ATK: 0 } }
  ];
  const eq = { weapon: { name: 'Dull Knife', slot: 'weapon', value: 1, mods: { ATK: 1 } } };
  const ctx = setup(items, eq);
  await loadRender(ctx);
  ctx.renderInv();
  const slots = ctx.document.querySelectorAll('.slot');
  assert.equal(slots.length, 2);
  assert.ok(slots[0].classList.contains('better'));
  assert.ok(!slots[1].classList.contains('better'));
});
