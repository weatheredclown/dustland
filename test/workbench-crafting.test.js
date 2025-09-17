import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const file = path.join('scripts', 'workbench.js');
const src = fs.readFileSync(file, 'utf8');

test('craftSignalBeacon consumes fuel and scrap', () => {
  const context = {
    Dustland: {},
    EventBus: { emit: () => {} },
    player: { scrap: 10, fuel: 100, inv: [] },
    addToInv: id => { context.player.inv.push({ id }); return true; },
    log: () => {}
  };
  vm.runInNewContext(src, context);
  context.Dustland.workbench.craftSignalBeacon();
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
  context.Dustland.workbench.craftSolarTarp();
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
  context.Dustland.workbench.craftBandage();
  assert.ok(context.player.inv.some(i => i.id === 'bandage'));
  assert.ok(!context.player.inv.some(i => i.id === 'plant_fiber'));
});
