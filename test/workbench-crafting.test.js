import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const file = path.join('scripts', 'workbench.js');
const src = fs.readFileSync(file, 'utf8');

function registerDustlandRecipes(context) {
  const workbench = context?.Dustland?.workbench;
  if (!workbench || typeof workbench.setRecipes !== 'function') return;
  const bus = context.EventBus;
  const log = typeof context.log === 'function' ? context.log : () => {};
  const addToInv = typeof context.addToInv === 'function' ? context.addToInv : () => false;
  const hasItem = typeof context.hasItem === 'function' ? context.hasItem : () => false;
  const findItemIndex = typeof context.findItemIndex === 'function' ? context.findItemIndex : () => -1;
  const removeFromInv = typeof context.removeFromInv === 'function' ? context.removeFromInv : () => {};

  workbench.setRecipes([
    {
      id: 'signal_beacon',
      name: 'Signal Beacon',
      craft: () => {
        const actor = context.player;
        if (!actor) return false;
        const scrapCost = 5;
        const fuelCost = 50;
        const scrap = Number(actor.scrap) || 0;
        const fuel = Number(actor.fuel) || 0;
        if (scrap < scrapCost) { log('Need 5 scrap.'); return false; }
        if (fuel < fuelCost) { log('Need 50 fuel.'); return false; }
        actor.scrap = scrap - scrapCost;
        actor.fuel = fuel - fuelCost;
        addToInv('signal_beacon');
        if (bus?.emit) bus.emit('craft:signal-beacon');
        log('Crafted a signal beacon.');
        return true;
      },
      requirements: [
        { label: 'Scrap', key: 'scrap', amount: 5, type: 'resource' },
        { label: 'Fuel', key: 'fuel', amount: 50, type: 'resource' }
      ]
    },
    {
      id: 'solar_tarp',
      name: 'Solar Panel Tarp',
      craft: () => {
        const actor = context.player;
        if (!actor) return false;
        const scrapCost = 3;
        const scrap = Number(actor.scrap) || 0;
        if (scrap < scrapCost) { log('Need 3 scrap.'); return false; }
        if (!hasItem('cloth')) { log('Need cloth.'); return false; }
        actor.scrap = scrap - scrapCost;
        const idx = findItemIndex('cloth');
        if (idx >= 0) removeFromInv(idx);
        addToInv('solar_tarp');
        if (bus?.emit) bus.emit('craft:solar-tarp');
        log('Crafted a solar panel tarp.');
        return true;
      },
      requirements: [
        { label: 'Scrap', key: 'scrap', amount: 3, type: 'resource' },
        { label: 'Cloth', key: 'cloth', amount: 1, type: 'item' }
      ]
    },
    {
      id: 'bandage',
      name: 'Bandage',
      craft: () => {
        if (!hasItem('plant_fiber')) { log('Need plant fiber.'); return false; }
        const idx = findItemIndex('plant_fiber');
        if (idx >= 0) removeFromInv(idx);
        addToInv('bandage');
        if (bus?.emit) bus.emit('craft:bandage');
        log('Crafted a bandage.');
        return true;
      },
      requirements: [
        { label: 'Plant Fiber', key: 'plant_fiber', amount: 1, type: 'item' }
      ]
    },
    {
      id: 'antidote',
      name: 'Antidote',
      craft: () => {
        if (!hasItem('plant_fiber')) { log('Need plant fiber.'); return false; }
        if (!hasItem('water_flask')) { log('Need a water flask.'); return false; }
        let idx = findItemIndex('plant_fiber');
        if (idx >= 0) removeFromInv(idx);
        idx = findItemIndex('water_flask');
        if (idx >= 0) removeFromInv(idx);
        addToInv('antidote');
        if (bus?.emit) bus.emit('craft:antidote');
        log('Crafted an antidote.');
        return true;
      },
      requirements: [
        { label: 'Plant Fiber', key: 'plant_fiber', amount: 1, type: 'item' },
        { label: 'Water Flask', key: 'water_flask', amount: 1, type: 'item' }
      ]
    }
  ]);
}


test('craftSignalBeacon consumes fuel and scrap', () => {
  const context = {
    Dustland: {},
    EventBus: { emit: () => {} },
    player: { scrap: 10, fuel: 100, inv: [] },
    addToInv: id => { context.player.inv.push({ id }); return true; },
    log: () => {}
  };
  vm.runInNewContext(src, context);
  registerDustlandRecipes(context);
  context.Dustland.workbench.craft('signal_beacon');
  assert.strictEqual(context.player.scrap, 5);
  assert.strictEqual(context.player.fuel, 50);
  assert.ok(context.player.inv.some(i => i.id === 'signal_beacon'));
});

test('craftSolarTarp uses cloth and scrap', () => {
  const context = {
    Dustland: {},
    EventBus: { emit: () => {} },
    player: { scrap: 4, inv: [{ id: 'cloth' }] },
    addToInv: id => { context.player.inv.push({ id }); return true; },
    hasItem: id => context.player.inv.some(i => i.id === id),
    findItemIndex: id => context.player.inv.findIndex(i => i.id === id),
    removeFromInv: (idx, qty = 1) => {
      const item = context.player.inv[idx];
      if (!item) return;
      const count = Number.isFinite(item?.count) ? item.count : 1;
      if (count > qty) {
        item.count = count - qty;
      } else {
        context.player.inv.splice(idx, 1);
      }
    },
    log: () => {}
  };
  vm.runInNewContext(src, context);
  registerDustlandRecipes(context);
  context.Dustland.workbench.craft('solar_tarp');
  assert.strictEqual(context.player.scrap, 1);
  assert.ok(context.player.inv.some(i => i.id === 'solar_tarp'));
  assert.ok(!context.player.inv.some(i => i.id === 'cloth'));
});

test('craftBandage consumes plant fiber', () => {
  const context = {
    Dustland: {},
    EventBus: { emit: () => {} },
    player: { scrap: 0, inv: [{ id: 'plant_fiber' }] },
    addToInv: id => { context.player.inv.push({ id }); return true; },
    hasItem: id => context.player.inv.some(i => i.id === id),
    findItemIndex: id => context.player.inv.findIndex(i => i.id === id),
    removeFromInv: (idx, qty = 1) => {
      const item = context.player.inv[idx];
      if (!item) return;
      const count = Number.isFinite(item?.count) ? item.count : 1;
      if (count > qty) {
        item.count = count - qty;
      } else {
        context.player.inv.splice(idx, 1);
      }
    },
    log: () => {}
  };
  vm.runInNewContext(src, context);
  registerDustlandRecipes(context);
  context.Dustland.workbench.craft('bandage');
  assert.ok(context.player.inv.some(i => i.id === 'bandage'));
  assert.ok(!context.player.inv.some(i => i.id === 'plant_fiber'));
});

test('craftAntidote consumes plant fiber and water flask', () => {
  const context = {
    Dustland: {},
    EventBus: { emit: () => {} },
    player: { scrap: 0, inv: [{ id: 'plant_fiber' }, { id: 'water_flask' }] },
    addToInv: id => { context.player.inv.push({ id }); return true; },
    hasItem: id => context.player.inv.some(i => i.id === id),
    findItemIndex: id => context.player.inv.findIndex(i => i.id === id),
    removeFromInv: (idx, qty = 1) => {
      const item = context.player.inv[idx];
      if (!item) return;
      const count = Number.isFinite(item?.count) ? item.count : 1;
      if (count > qty) {
        item.count = count - qty;
      } else {
        context.player.inv.splice(idx, 1);
      }
    },
    log: () => {}
  };
  vm.runInNewContext(src, context);
  registerDustlandRecipes(context);
  context.Dustland.workbench.craft('antidote');
  assert.ok(context.player.inv.some(i => i.id === 'antidote'));
  assert.ok(!context.player.inv.some(i => i.id === 'plant_fiber'));
  assert.ok(!context.player.inv.some(i => i.id === 'water_flask'));
});

test('craftEnhancedItem upgrades weapons when you have five copies', () => {
  const registry = new Map();
  const context = {
    Dustland: {},
    EventBus: { emit: () => {} },
    player: { scrap: 0, inv: [] },
    log: () => {},
    registerItem: def => {
      registry.set(def.id, JSON.parse(JSON.stringify(def)));
      return def;
    },
    getItem: id => {
      const item = registry.get(id);
      return item ? JSON.parse(JSON.stringify(item)) : null;
    }
  };
  context.addToInv = item => {
    const entry = typeof item === 'string' ? context.getItem(item) : item;
    if (!entry) return false;
    context.player.inv.push(JSON.parse(JSON.stringify(entry)));
    return true;
  };
  context.findItemIndex = id => context.player.inv.findIndex(it => it.id === id);
  context.removeFromInv = idx => {
    if (idx >= 0) context.player.inv.splice(idx, 1);
  };
  context.countItems = id => context.player.inv.filter(it => it.id === id).length;

  vm.runInNewContext(src, context);

  context.registerItem({ id: 'pipe_blade', name: 'Pipe Blade', type: 'weapon', mods: { ATK: 2, ADR: 12 } });
  for (let i = 0; i < 5; i += 1) {
    context.player.inv.push(context.getItem('pipe_blade'));
  }

  context.Dustland.workbench.craftEnhancedItem('pipe_blade');

  const enhanced = context.getItem('enhanced_pipe_blade');
  assert.ok(enhanced, 'enhanced item should be registered');
  assert.strictEqual(enhanced.mods.ATK, 4);
  assert.strictEqual(enhanced.mods.ADR, 24);
  assert.strictEqual(enhanced.baseId, 'pipe_blade');
  assert.strictEqual(context.player.inv.filter(it => it.id === 'pipe_blade').length, 0);
  assert.ok(context.player.inv.some(it => it.id === 'enhanced_pipe_blade'));
  assert.ok(context.player.inv.every(it => it.baseId === 'pipe_blade'));
  assert.strictEqual(context.player.inv.length, 1);
});
