import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// ensure narrative tags emit events on pickup

test('narrative tag emits item:narrative', async () => {
  const events = [];
  const bus = { emit(evt, payload){ events.push({ evt, payload }); } };
  const context = { console, EventBus: bus, player:{ inv:[] }, party:[{}], log:()=>{}, toast:()=>{} };
  vm.createContext(context);
  const inv = await fs.readFile(new URL('../scripts/core/inventory.js', import.meta.url), 'utf8');
  vm.runInContext(inv, context);
  context.registerItem({ id:'n1', name:'Narrative', type:'misc', narrative:{ id:'story1', prompt:'?' } });
  context.addToInv('n1');
  const evt = events.find(e => e.evt === 'item:narrative');
  assert.ok(evt);
  assert.strictEqual(evt.payload.itemId, 'n1');
  assert.strictEqual(
    JSON.stringify(evt.payload.narrative),
    JSON.stringify({ id:'story1', prompt:'?' })
  );
});
