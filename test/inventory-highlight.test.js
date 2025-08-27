import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

function setup(items, equipped){
  const dom = new JSDOM('<div id="inv"></div>');
  const equips = Array.isArray(equipped) ? equipped : [equipped];
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    player: { inv: items },
    party: equips.map(eq => ({ equip: eq })),
    selectedMember: 0,
    SpoilsCache: { renderIcon: () => null, open: () => {}, openAll: () => {} },
    useItem: () => {},
    CURRENCY: '',
    log: () => {},
    renderParty: () => {},
    updateHUD: () => {},
    EventBus: { emit: () => {} }
  };
  ctx.equipItem = (memberIndex, invIndex) => {
    const m = ctx.party[memberIndex];
    const it = ctx.player.inv[invIndex];
    if(!m || !it) return;
    m.equip[it.slot] = it;
    ctx.player.inv.splice(invIndex,1);
  };
  vm.createContext(ctx);
  return ctx;
}

async function loadRender(ctx){
  const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const start = full.indexOf('function calcItemValue');
  const end = full.indexOf('function renderQuests');
  vm.runInContext(full.slice(start, end), ctx);
}

async function loadSetLeader(ctx){
  const full = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  const start = full.indexOf('let selectedMember');
  const end = full.indexOf('function respec');
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

test('leader change re-evaluates highlights', async () => {
  const items = [
    { name: 'Bronze Sword', slot: 'weapon', value: 3 }
  ];
  const eqs = [
    { weapon: { name: 'Steel Sword', slot: 'weapon', value: 4 } },
    { weapon: { name: 'Rusty Sword', slot: 'weapon', value: 1 } }
  ];
  const ctx = setup(items, eqs);
  await loadRender(ctx);
  await loadSetLeader(ctx);
  ctx.renderInv();
  let slots = ctx.document.querySelectorAll('.slot');
  assert.equal(slots.length, 1);
  assert.ok(!slots[0].classList.contains('better'));
  ctx.setLeader(1);
  slots = ctx.document.querySelectorAll('.slot');
  assert.equal(slots.length, 1);
  assert.ok(slots[0].classList.contains('better'));
});

test('setLeader equips missing gear and suggests a single upgrade per slot', async () => {
  const items = [
    { name: 'Axe', slot: 'weapon', value: 2 },
    { name: 'Chain', slot: 'armor', value: 2 },
    { name: 'Scale', slot: 'armor', value: 2 }
  ];
  const eqs = [
    { weapon: { name: 'Spear', slot: 'weapon', value: 3 }, armor: { name: 'Cloth', slot: 'armor', value: 1 } },
    { weapon: null, armor: { name: 'Tunic', slot: 'armor', value: 1 } }
  ];
  const ctx = setup(items, eqs);
  await loadRender(ctx);
  await loadSetLeader(ctx);
  vm.runInContext('Math.random = () => 0;', ctx);
  ctx.setLeader(1);
  assert.ok(ctx.party[1].equip.weapon);
  const better = ctx.document.querySelectorAll('.slot.better');
  assert.equal(better.length, 1);
});
