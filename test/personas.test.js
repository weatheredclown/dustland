import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('personas register alternate masks', async () => {
  const dom = new JSDOM('<body></body>');
  const context = { window: dom.window, document: dom.window.document, console };
  vm.createContext(context);
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInContext(gs, context);
  const ps = await fs.readFile(new URL('../scripts/core/personas.js', import.meta.url), 'utf8');
  vm.runInContext(ps, context);
  const gp = context.Dustland.gameState.getPersona;
  assert.ok(gp('mara.masked'));
  assert.ok(gp('jax.patchwork'));
  assert.ok(gp('nyx.veiled'));
});
