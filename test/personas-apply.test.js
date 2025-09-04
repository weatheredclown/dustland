import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('applyPersona assigns persona to party member', async () => {
  const dom = new JSDOM('<body></body>');
  const context = { window: dom.window, document: dom.window.document, console };
  vm.createContext(context);
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInContext(gs, context);
  context.Dustland.gameState.updateState(s => { s.party = [{ id: 'mara', name: 'Mara' }]; });
  const ps = await fs.readFile(new URL('../scripts/core/personas.js', import.meta.url), 'utf8');
  vm.runInContext(ps, context);
  const applyPersona = context.Dustland.gameState.applyPersona;
  applyPersona('mara', 'mara.masked');
  const st = context.Dustland.gameState.getState();
  assert.strictEqual(st.party[0].persona, 'mara.masked');
});
