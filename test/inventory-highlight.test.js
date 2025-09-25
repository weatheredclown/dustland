import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { basicDom } from './dom-fixture.js';

function setup(items, equipped){
  const dom = new JSDOM(`<body>${basicDom}</body>`);
  const equips = Array.isArray(equipped) ? equipped : [equipped];
  const bus = { emit: () => {} };
  const party = equips.map(e => {
    if(e && typeof e === 'object'){
      const equip = e.equip || e;
      const stats = e.stats || {};
      const lvl = Number.isFinite(e.lvl) ? e.lvl : 1;
      const role = typeof e.role === 'string' ? e.role : 'scavenger';
      return { equip, stats, lvl, role };
    }
    return { equip: e, lvl: 1, role: 'scavenger' };
  });
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    player: { inv: items },
    party,
    selectedMember: 0,
    SpoilsCache: { renderIcon: () => null, open: () => {}, openAll: () => {} },
    useItem: () => {},
    CURRENCY: '',
    log: () => {},
    renderParty: () => {},
    updateHUD: () => {},
    EventBus: bus,
    Dustland: { eventBus: bus },
    statLine: () => '',
    xpToNext: () => 1,
    unequipItem: () => {}
  };
  ctx.equipItem = (memberIndex, invIndex) => {
    const m = ctx.party[memberIndex];
    const it = ctx.player.inv[invIndex];
    if(!m || !it) return;
    m.equip[it.type] = it;
    ctx.player.inv.splice(invIndex,1);
  };
  vm.createContext(ctx);
  return ctx;
}

async function loadRender(ctx){
  const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const start = full.indexOf('function calcItemValue');
  const end = full.indexOf('function openShop');
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
    { name: 'Shiny Blade', type: 'weapon', value: 3, mods: { ATK: 2 } },
    { name: 'Old Stick', type: 'weapon', value: 1, mods: { ATK: 0 } }
  ];
  const eq = { weapon: { name: 'Dull Knife', type: 'weapon', value: 1, mods: { ATK: 1 } } };
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
    { name: 'Bronze Sword', type: 'weapon', value: 3 }
  ];
  const eqs = [
    { weapon: { name: 'Steel Sword', type: 'weapon', value: 4 } },
    { weapon: { name: 'Rusty Sword', type: 'weapon', value: 1 } }
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

test('party selection refreshes item highlights', async () => {
  const items = [
    { name: 'Bronze Sword', type: 'weapon', value: 3 }
  ];
  const eqs = [
    { weapon: { name: 'Steel Sword', type: 'weapon', value: 4 } },
    { weapon: { name: 'Rusty Sword', type: 'weapon', value: 1 } }
  ];
  const ctx = setup(items, eqs);
  await loadRender(ctx);
  ctx.renderParty();
  ctx.renderInv();
  let slot = ctx.document.querySelector('.slot');
  assert.ok(!slot.classList.contains('better'));
  ctx.document.querySelectorAll('.pcard')[1].click();
  slot = ctx.document.querySelector('.slot');
  assert.ok(slot.classList.contains('better'));
});

test('weapon suggestions respect member stats and weapon type', async () => {
  const items = [
    { name: 'Pipe Rifle', type: 'weapon', tags: ['ranged'], mods: { ATK: 2, ADR: 15 } },
    { name: 'Crowbar', type: 'weapon', mods: { ATK: 1, ADR: 10 } }
  ];
  const eqs = [
    { equip: {}, stats: { STR: 8, AGI: 4, INT: 4, PER: 4, LCK: 4, CHA: 4 } },
    { equip: {}, stats: { STR: 4, AGI: 8, INT: 4, PER: 4, LCK: 4, CHA: 4 } }
  ];
  const ctx = setup(items, eqs);
  await loadRender(ctx);
  ctx.renderParty();
  ctx.renderInv();
  let slots = ctx.document.querySelectorAll('.slot');
  assert.equal(slots.length, 2);
  assert.ok(slots[1].classList.contains('better'));
  assert.ok(!slots[0].classList.contains('better'));
  ctx.document.querySelectorAll('.pcard')[1].click();
  slots = ctx.document.querySelectorAll('.slot');
  assert.ok(slots[0].classList.contains('better'));
  assert.ok(!slots[1].classList.contains('better'));
});

test('role requirements are case-insensitive for equip highlights', async () => {
  const whip = () => ({ name: 'Thornlash Whip', type: 'weapon', mods: { ATK: 3, ADR: 18 } });
  const sixShooter = () => ({
    name: 'Dawnforge Six-Shooter',
    type: 'weapon',
    tags: ['ranged'],
    mods: { ATK: 4, ADR: 20, LCK: 1 },
    equip: { requires: { role: 'Gunslinger' } }
  });
  const items = [whip(), sixShooter()];
  const eq = {
    equip: { weapon: whip() },
    stats: { STR: 1, AGI: 20, INT: 4, PER: 4, LCK: 4, CHA: 4 },
    role: 'gunslinger'
  };
  const ctx = setup(items, eq);
  await loadRender(ctx);
  ctx.renderInv();
  const slots = ctx.document.querySelectorAll('.slot');
  assert.equal(slots.length, 2);
  assert.ok(!slots[0].classList.contains('better'));
  assert.ok(slots[1].classList.contains('better'));
});

test('setLeader equips missing gear and suggests a single upgrade per slot', async () => {
  const items = [
    { name: 'Axe', type: 'weapon', value: 2 },
    { name: 'Chain', type: 'armor', value: 2 },
    { name: 'Scale', type: 'armor', value: 2 }
  ];
  const eqs = [
    { weapon: { name: 'Spear', type: 'weapon', value: 3 }, armor: { name: 'Cloth', type: 'armor', value: 1 } },
    { weapon: null, armor: { name: 'Tunic', type: 'armor', value: 1 } }
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

test('strong weapons are level locked until requirement met', async () => {
  const items = [
    { name: 'Epic Blade', type: 'weapon', mods: { ATK: 8 } }
  ];
  const eq = { equip: { weapon: null, armor: null, trinket: null }, stats: { STR: 8 }, lvl: 1 };
  const ctx = setup(items, eq);
  await loadRender(ctx);
  ctx.party[0].lvl = 1;
  ctx.renderInv();
  let slot = ctx.document.querySelector('.slot');
  assert.ok(slot.classList.contains('level-locked'));
  const equipBtn = slot.querySelector('button[data-a="equip"]');
  assert.ok(equipBtn?.disabled);
  assert.match(equipBtn?.title || '', /Requires level/);
  ctx.party[0].lvl = 6;
  ctx.renderInv();
  slot = ctx.document.querySelector('.slot');
  assert.ok(!slot.classList.contains('level-locked'));
  const readyBtn = slot.querySelector('button[data-a="equip"]');
  assert.ok(readyBtn && !readyBtn.disabled);
  assert.match(readyBtn.title, /Equip/);
});
