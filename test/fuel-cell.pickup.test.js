import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const file = path.join('scripts', 'core', 'inventory.js');
const src = fs.readFileSync(file, 'utf8');

test('fuel cell pickup adds fuel instead of inventory', () => {
  const context = {
    EventBus: { emit: () => {} },
    party: [],
    player: { inv: [], fuel: 0 },
    log: () => {}
  };
  vm.runInNewContext(src, context);
  context.addToInv({ id: 'fuel_cell', name: 'Fuel Cell', type: 'quest' });
  assert.strictEqual(context.player.fuel, 50);
  assert.strictEqual(context.player.inv.length, 0);
});
