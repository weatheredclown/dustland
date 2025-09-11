import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

const code = await fs.readFile(new URL('../scripts/supporting/multiplayer-lobby.js', import.meta.url), 'utf8');

test('refresh shows fetch error', async () => {
  const document = makeDocument();
  document.body.appendChild(document.getElementById('sessions'));
  document.body.appendChild(document.getElementById('refresh'));
  document.body.appendChild(document.getElementById('host'));
  const context = {
    document,
    fetch: () => Promise.reject(new Error('boom')),
    alert: () => {},
    prompt: () => 'Game',
    Dustland: { multiplayer: { startHost: async () => {} } },
    window: { location: { href: '' } }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  await new Promise(r => setTimeout(r));
  assert.ok(document.getElementById('sessions').textContent.includes('boom'));
});

test('host shows start error', async () => {
  const document = makeDocument();
  document.body.appendChild(document.getElementById('sessions'));
  document.body.appendChild(document.getElementById('refresh'));
  document.body.appendChild(document.getElementById('host'));
  const messages = [];
  const context = {
    document,
    fetch: () => Promise.resolve({ json: () => [] }),
    alert: m => messages.push(m),
    prompt: () => 'Game',
    Dustland: { multiplayer: { startHost: async () => { throw new Error('no ws'); } } },
    window: { location: { href: '' } }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  await Promise.resolve();
  await context.document.getElementById('host').onclick();
  assert.ok(messages[0].includes('no ws'));
  assert.equal(document.getElementById('host').disabled, false);
});
