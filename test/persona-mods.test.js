import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

// ensure persona mods affect combat stats

test('persona mods apply combat bonuses', async () => {
  const dom = new JSDOM('<body></body>');
  const listeners = {};
  const bus = { on(evt,fn){ (listeners[evt]=listeners[evt]||[]).push(fn); }, emit(evt,p){ (listeners[evt]||[]).forEach(fn=>fn(p)); } };
  const context = { window: dom.window, document: dom.window.document, console, EventBus: bus };
  vm.createContext(context);
  context.log = () => {};
  context.renderParty = () => {};
  context.updateHUD = () => {};
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInContext(gs, context);
  const partyJs = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInContext(partyJs, context);
  const personasJs = await fs.readFile(new URL('../scripts/core/personas.js', import.meta.url), 'utf8');
  vm.runInContext(personasJs, context);
  bus.emit('item:picked', { tags:['mask'], persona:'mara.masked' });
  const { makeMember, joinParty } = context;
  const m = makeMember('mara', 'Mara', 'scout');
  joinParty(m);
  context.Dustland.gameState.updateState(s => { s.party = context.party; });
  context.Dustland.gameState.applyPersona('mara', 'mara.masked');
  assert.strictEqual(m._bonus.AGI, 1);
});
