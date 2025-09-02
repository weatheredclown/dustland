import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

test('camera recenters on party collapse', async () => {
  const { context } = createGameProxy([]);
  context.log = () => {};
  context.toast = () => {};
  context.renderParty = () => {};
  context.updateHUD = () => {};
  context.setPartyPos = (x, y) => { context.party.x = x; context.party.y = y; };
  let centered = null;
  context.centerCamera = (x, y, map) => { centered = { x, y, map }; };
  context.state.map = 'world';
  context.state.mapEntry = { map: 'world', x: 5, y: 6 };
  const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInContext(partyCode, context);
  const mem = new context.Character('t','Tester','');
  mem.hp = 0;
  mem.maxHp = 10;
  context.party.join(mem);
  const moveCode = await fs.readFile(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  vm.runInContext(moveCode, context);
  context.applyZones('world', 0, 0);
  assert.deepStrictEqual(centered, { x: 5, y: 6, map: 'world' });
});
