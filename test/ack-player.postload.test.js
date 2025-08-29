import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

test('ack-player loads module script and runs postLoad', async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const html = `<!DOCTYPE html><body>
    <input id="modUrl">
    <button id="modUrlBtn"></button>
    <input id="modFile">
    <button id="modFileBtn"></button>
    <div id="moduleLoader"></div>
  </body>`;
  const dom = new JSDOM(html, { url: 'http://localhost', runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.location = window.location;
  window.requestAnimationFrame = () => {};
  global.requestAnimationFrame = window.requestAnimationFrame;
  const store = {};
  const ls = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };
  Object.defineProperty(window, 'localStorage', { value: ls });
  global.localStorage = ls;
  const UIstub = { hide: () => {}, setValue: () => {} };
  global.UI = UIstub;
  window.UI = UIstub;
  window.openCreator = () => {};
  window.params = new URLSearchParams('');
  global.params = window.params;
  const file = path.join(__dirname, '..', 'scripts', 'ack-player.js');
  window.eval(fs.readFileSync(file, 'utf8'));
  const mod = {
    module: 'data:text/javascript,globalThis.TEST_MOD={postLoad:(m)=>{m.executed=true;}}',
    moduleVar: 'TEST_MOD'
  };
  await window.loadModule(mod);
  assert.ok(mod.executed);
});
