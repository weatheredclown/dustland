import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const file = path.join('scripts', 'workbench.js');
const src = fs.readFileSync(file, 'utf8');

test('craftSignalBeacon consumes materials', () => {
  const context = {
    Dustland: {},
    EventBus: { emit: () => {} },
    player: { scrap: 10, inv: [{ id: 'power_cell' }] },
    addToInv: id => { context.player.inv.push({ id }); return true; },
    hasItem: id => context.player.inv.some(i => i.id === id),
    findItemIndex: id => context.player.inv.findIndex(i => i.id === id),
    removeFromInv: idx => context.player.inv.splice(idx, 1),
    log: () => {}
  };
  vm.runInNewContext(src, context);
  context.Dustland.workbench.craftSignalBeacon();
  assert.strictEqual(context.player.scrap, 5);
  assert.ok(context.player.inv.some(i => i.id === 'signal_beacon'));
  assert.ok(!context.player.inv.some(i => i.id === 'power_cell'));
});
