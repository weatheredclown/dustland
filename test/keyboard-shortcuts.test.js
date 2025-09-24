import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';

test('keyboard shortcuts toggle audio, mobile controls, and pickup', async () => {
  const { context, document } = createGameProxy([]);
  let takeCalls = 0;
  context.takeNearestItem = () => { takeCalls++; };
  const audioBtn = document.getElementById('audioToggle');
  const mobileBtn = document.getElementById('mobileToggle');
  const tileBtn = document.getElementById('tileCharToggle');
  const fogBtn = document.getElementById('fogToggle');
  assert.strictEqual(audioBtn.textContent, 'Audio: On');
  assert.strictEqual(mobileBtn.textContent, 'Mobile Controls: Off');
  assert.strictEqual(tileBtn.textContent, 'ASCII Tiles: On');
  assert.strictEqual(fogBtn.textContent, 'Fog of War: On');

  context.window.dispatchEvent(new context.window.KeyboardEvent('keydown', { key:'o' }));
  assert.strictEqual(audioBtn.textContent, 'Audio: Off');

  context.window.dispatchEvent(new context.window.KeyboardEvent('keydown', { key:'c' }));
  assert.strictEqual(mobileBtn.textContent, 'Mobile Controls: On');

  context.window.dispatchEvent(new context.window.KeyboardEvent('keydown', { key:'j' }));
  assert.strictEqual(tileBtn.textContent, 'ASCII Tiles: Off');

  context.window.dispatchEvent(new context.window.KeyboardEvent('keydown', { key:'f' }));
  assert.strictEqual(fogBtn.textContent, 'Fog of War: Off');

  context.window.dispatchEvent(new context.window.KeyboardEvent('keydown', { key:'g' }));
  assert.strictEqual(takeCalls, 1);
});
