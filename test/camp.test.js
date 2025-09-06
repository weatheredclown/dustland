import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';

test('camp:open heals party and refills hydration', async () => {
  const bus = new EventEmitter();
  let healed = false;
  let msg = '';
  const healAll = () => { healed = true; };
  const log = m => { msg = m; };
  const gs = {
    getState: () => ({ party: [{ id: 'p1', name: 'Hero' }], personas: { a: {} } }),
    applyPersona: () => {}
  };
  const party = [{ id: 'p1', name: 'Hero', hydration: 0 }];
  party.x = 0; party.y = 0;
  const state = { map: 'world' };
  const sandbox = {
    EventBus: bus,
    Dustland: { gameState: gs, zoneEffects: [] },
    document: { getElementById: () => null },
    healAll,
    log,
    prompt: () => null,
    party,
    state,
    updateHUD: () => {}
  };
  sandbox.globalThis = sandbox;
  const code = await fs.readFile(new URL('../scripts/camp-persona.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  bus.emit('camp:open');
  assert.ok(healed);
  assert.equal(party[0].hydration, 2);
  assert.equal(msg, 'You rest until healed.');
});

test('camp:open blocked in dry or damaging zones', async () => {
  const bus = new EventEmitter();
  let healed = false;
  let msg = '';
  const healAll = () => { healed = true; };
  const log = m => { msg = m; };
  const gs = {
    getState: () => ({ party: [{ id: 'p1', name: 'Hero' }], personas: {} }),
    applyPersona: () => {}
  };
  const party = [{ id: 'p1', name: 'Hero', hydration: 1 }];
  party.x = 0; party.y = 0;
  const state = { map: 'world' };
  const sandbox = {
    EventBus: bus,
    Dustland: { gameState: gs, zoneEffects: [] },
    document: { getElementById: () => null },
    healAll,
    log,
    prompt: () => null,
    party,
    state,
    updateHUD: () => {}
  };
  sandbox.globalThis = sandbox;
  const code = await fs.readFile(new URL('../scripts/camp-persona.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  const zones = sandbox.Dustland.zoneEffects;

  zones.push({ map: 'world', x: 0, y: 0, w: 1, h: 1, dry: true });
  bus.emit('camp:open');
  assert.ok(!healed);
  assert.equal(party[0].hydration, 1);
  assert.equal(msg, "You can't camp here.");

  zones[0] = { map: 'world', x: 0, y: 0, w: 1, h: 1, perStep: { hp: -1 } };
  healed = false; msg = '';
  bus.emit('camp:open');
  assert.ok(!healed);
  assert.equal(party[0].hydration, 1);
  assert.equal(msg, "You can't camp here.");
});
