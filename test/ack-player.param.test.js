import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

test('ack-player auto-loads module from URL param', async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const html = `<!DOCTYPE html><body>
    <div id="moduleLoader"></div>
    <input id="modUrl" />
    <button id="modUrlBtn"></button>
    <input id="modFile" />
    <button id="modFileBtn"></button>
  </body>`;
  const dom = new JSDOM(html, { url: 'http://localhost/dustland.html?ack-player=1&module=modules/golden.module.json' });
  const { window } = dom;
  let started = false;
  window.openCreator = () => { started = true; };
  window.applyModule = () => {};
  global.window = window;
  global.document = window.document;
  global.openCreator = window.openCreator;
  global.applyModule = window.applyModule;
  global.location = window.location;
  global.params = new URLSearchParams(window.location.search);
  global.alert = () => {};
  window.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });
  global.fetch = window.fetch;
  const store = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k) => store[k],
      setItem: (k, v) => {
        store[k] = String(v);
      },
      removeItem: (k) => {
        delete store[k];
      }
    },
    configurable: true
  });
  global.localStorage = window.localStorage;
  const scriptPath = path.join(__dirname, '..', 'ack-player.js');
  window.eval(fs.readFileSync(scriptPath, 'utf8'));
  await new Promise((r) => setTimeout(r, 10));
  assert.ok(started, 'openCreator called after auto load');
});
