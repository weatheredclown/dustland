import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('personas register alternate masks', async () => {
  const dom = new JSDOM('<body></body>');
  const listeners = {};
  const bus = { on(evt,fn){ (listeners[evt]=listeners[evt]||[]).push(fn); }, emit(evt,p){ (listeners[evt]||[]).forEach(fn=>fn(p)); } };
  const context = { window: dom.window, document: dom.window.document, console, EventBus: bus };
  vm.createContext(context);
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInContext(gs, context);
  const ps = await fs.readFile(new URL('../scripts/core/personas.js', import.meta.url), 'utf8');
  vm.runInContext(ps, context);
  bus.emit('item:picked', { tags:['mask'], persona:'mara.masked' });
  bus.emit('item:picked', { tags:['Mask'], persona:'jax.patchwork' });
  bus.emit('item:picked', { tags:['MASK'], persona:'nyx.veiled' });
  const gp = context.Dustland.gameState.getPersona;
  assert.ok(gp('mara.masked'));
  assert.ok(gp('jax.patchwork'));
  assert.ok(gp('nyx.veiled'));
});
