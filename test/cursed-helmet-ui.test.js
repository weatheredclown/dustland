import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

test('cursed equipment keeps label after failed unequip', async () => {
  const { context, document } = createGameProxy([]);
  context.player.inv = [];
  context.updateHUD = () => {};
  const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInContext(partyCode, context);
  const invCode = await fs.readFile(new URL('../scripts/core/inventory.js', import.meta.url), 'utf8');
  vm.runInContext(invCode, context);
  const mem = new context.Character('hero', 'Hero', 'Role');
  context.party.join(mem);
  context.registerItem({ id: 'helm', name: 'VR Helmet', type: 'armor', cursed: true });
  context.addToInv('helm');
  context.equipItem(0, 0);
  context.renderParty();
  const partyDiv = document.getElementById('party');
  assert.match(partyDiv.children[0].innerHTML, /VR Helmet/);
  context.unequipItem(0, 'armor');
  context.renderParty();
  assert.match(partyDiv.children[0].innerHTML, /VR Helmet/);
});
