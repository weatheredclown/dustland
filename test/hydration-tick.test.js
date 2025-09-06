import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('hydration only drains in dry zones', async () => {
  const code = await fs.readFile(new URL('../scripts/core/status.js', import.meta.url), 'utf8');
  const handlers = {};
  const bus = {
    on(evt, fn){ handlers[evt] = fn; },
    emit(evt, data){ handlers[evt]?.(data); }
  };
  const party = [{ hydration: 2 }];
  party.x = 0; party.y = 0; party.map = 'world';
  const context = {
    Dustland: { eventBus: bus, zoneEffects: [] },
    party,
    updateHUDCalled: 0,
    updateHUD(){ this.updateHUDCalled++; }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  assert.ok(handlers['hydration:tick']);
  bus.emit('hydration:tick');
  assert.strictEqual(context.party[0].hydration, 2);
  assert.strictEqual(context.updateHUDCalled, 0);
  context.Dustland.zoneEffects.push({ map:'world', x:0, y:0, w:1, h:1, dry:true });
  bus.emit('hydration:tick');
  assert.strictEqual(context.party[0].hydration, 1);
  assert.strictEqual(context.updateHUDCalled, 1);
});
