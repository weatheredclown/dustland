import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

test('ack-player registers profiles from module', async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const html = `<!DOCTYPE html><body>
    <div id="moduleLoader"></div>
    <input id="modUrl" />
    <button id="modUrlBtn"></button>
    <input id="modFile" />
    <button id="modFileBtn"></button>
  </body>`;
  const dom = new JSDOM(html, { url: 'http://localhost/dustland.html?ack-player=1' });
  const { window } = dom;
  const store = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k) => store[k],
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    }
  });
  window.localStorage.setItem('ack_playtest', JSON.stringify({ profiles: { 'p.test': { mods: { STR: 1 } } } }));
  const calls = [];
  window.openCreator = () => {};
  window.applyModule = () => {};
  window.UI = { hide: () => {}, setValue: () => {} };
  window.Dustland = { profiles: { set(id, data){ calls.push({ id, data }); } } };
  window.EventBus = { on: () => {}, emit: () => {} };
  global.window = window;
  global.document = window.document;
  global.openCreator = window.openCreator;
  global.applyModule = window.applyModule;
  global.UI = window.UI;
  global.Dustland = window.Dustland;
  global.EventBus = window.EventBus;
  global.localStorage = window.localStorage;
  global.location = window.location;
  const scriptPath = path.join(__dirname, '..', 'scripts', 'ack-player.js');
  window.eval(fs.readFileSync(scriptPath, 'utf8'));
  await new Promise((r) => setTimeout(r, 20));
  assert.strictEqual(calls.length, 1);
  assert.deepStrictEqual(calls[0], { id: 'p.test', data: { mods: { STR: 1 } } });
});
