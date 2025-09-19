import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

test('renderParty reflects persona portrait and label', async () => {
  const party = [
    { id:'mara', name:'Mara', role:'Scout', lvl:1, hp:5, maxHp:5, adr:0, stats:{}, equip:{ weapon:null, armor:null, trinket:null }, _bonus:{}, portraitSheet:'assets/portraits/portrait_1000.png', xp:0 }
  ];
  const { context, document } = createGameProxy(party);
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInContext(gs, context);
  const ps = await fs.readFile(new URL('../scripts/core/personas.js', import.meta.url), 'utf8');
  vm.runInContext(ps, context);
  context.EventBus.emit('item:picked', { tags:['mask'], persona:'mara.masked' });
  context.Dustland.gameState.updateState(s => { s.party = party; });
  context.Dustland.gameState.applyPersona('mara', 'mara.masked');
  context.renderParty();
  const card = document.getElementById('party').children[0];
  const html = card.innerHTML || card._innerHTML || '';
  assert.ok(html.includes('Masked Mara'));
  const portrait = card.children[0].style.backgroundImage;
  assert.ok(portrait.includes('hidden_hermit_4.png'));
});

test('renderParty uses module persona overrides', async () => {
  const party = [
    { id:'mara', name:'Mara', role:'Scout', lvl:1, hp:5, maxHp:5, adr:0, stats:{}, equip:{ weapon:null, armor:null, trinket:null }, _bonus:{}, portraitSheet:'assets/portraits/portrait_1000.png', xp:0 }
  ];
  const { context, document } = createGameProxy(party);
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInContext(gs, context);
  const ps = await fs.readFile(new URL('../scripts/core/personas.js', import.meta.url), 'utf8');
  vm.runInContext(ps, context);
  context.itemDrops = [];
  context.ITEMS = {};
  context.quests = {};
  const core = await fs.readFile(new URL('../scripts/dustland-core.js', import.meta.url), 'utf8');
  vm.runInContext(core, context);
  context.applyModule({
    seed: 1,
    world: [[context.TILE?.SAND ?? 7]],
    personas: { 'mara.masked': { label: 'Echo Mara', portrait: 'assets/portraits/portrait_1005.png' } }
  }, { fullReset: true });
  context.EventBus.emit('item:picked', { tags:['mask'], persona:'mara.masked' });
  context.Dustland.gameState.updateState(s => { s.party = party; });
  context.Dustland.gameState.applyPersona('mara', 'mara.masked');
  context.renderParty();
  const card = document.getElementById('party').children[0];
  const html = card.innerHTML || card._innerHTML || '';
  assert.ok(html.includes('Echo Mara'));
  const portrait = card.children[0].style.backgroundImage;
  assert.ok(portrait.includes('portrait_1005.png'));
});
