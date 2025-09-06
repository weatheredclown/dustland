import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('signal compass hides for hidden target when navigation disabled', async () => {
  const code = await fs.readFile(new URL('../components/signal-compass.js', import.meta.url), 'utf8');
  const document = makeDocument();
  const window = { document };
  const ACK = { config: { navigation: { enabled: false } } };
  const ctx = { document, window, ACK, Dustland: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const compass = ctx.Dustland.createSignalCompass();
  compass.update({ x: 0, y: 0 }, { x: 10, y: 0, hidden: true });
  const el = document.querySelector('.signal-compass');
  assert.equal(el.style.display, 'none');
});

test('signal compass shows when navigation enabled', async () => {
  const code = await fs.readFile(new URL('../components/signal-compass.js', import.meta.url), 'utf8');
  const document = makeDocument();
  const window = { document };
  const ACK = { config: { navigation: { enabled: true } } };
  const ctx = { document, window, ACK, Dustland: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const compass = ctx.Dustland.createSignalCompass();
  compass.update({ x: 0, y: 0 }, { x: 10, y: 0, hidden: true });
  const el = document.querySelector('.signal-compass');
  assert.equal(el.style.display, '');
});
