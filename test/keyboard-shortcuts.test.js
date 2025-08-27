import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';

test('keyboard shortcuts toggle audio, mobile controls, and pickup', async () => {
  const { context, document } = createGameProxy([]);
  let takeCalls = 0;
  context.takeNearestItem = () => { takeCalls++; };
  const audioBtn = document.getElementById('audioToggle');
  const mobileBtn = document.getElementById('mobileToggle');
  assert.strictEqual(audioBtn.textContent, 'Audio: On');
  assert.strictEqual(mobileBtn.textContent, 'Mobile Controls: Off');

  context.window.dispatchEvent(new context.window.KeyboardEvent('keydown', { key:'o' }));
  assert.strictEqual(audioBtn.textContent, 'Audio: Off');

  context.window.dispatchEvent(new context.window.KeyboardEvent('keydown', { key:'c' }));
  assert.strictEqual(mobileBtn.textContent, 'Mobile Controls: On');

  context.window.dispatchEvent(new context.window.KeyboardEvent('keydown', { key:'g' }));
  assert.strictEqual(takeCalls, 1);
});
