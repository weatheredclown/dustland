import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

test('playSfx handles aborted play without unhandled rejection', async (t) => {
  const dom = new JSDOM(`<!doctype html><body>
    <div class="tabs">
      <button id="tabInv"></button>
      <button id="tabParty"></button>
      <button id="tabQuests"></button>
    </div>
    <div id="inv"></div>
    <div id="party"></div>
    <div id="quests"></div>
    <div id="log"></div>
    <div id="hp"></div>
    <div id="ap"></div>
    <div id="scrap"></div>
    <canvas id="game" width="64" height="64"></canvas>
  </body>`, { pretendToBeVisual: true });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  const realGetById = window.document.getElementById.bind(window.document);
  window.document.getElementById = id => {
    const el = realGetById(id);
    if (el) return el;
    if (id === 'game') {
      const canvas = window.document.createElement('canvas');
      canvas.id = 'game';
      canvas.width = 64;
      canvas.height = 64;
      window.document.body.appendChild(canvas);
      return canvas;
    }
    const div = window.document.createElement('div');
    div.id = id;
    window.document.body.appendChild(div);
    return div;
  };
  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
  global.requestAnimationFrame = window.requestAnimationFrame;
  global.cancelAnimationFrame = window.cancelAnimationFrame;
  global.location = window.location;
  globalThis.localStorage = { getItem: () => '{}', setItem() {}, removeItem() {}, clear() {} };
  global.showStart = () => {};
  const dummyCtx = new Proxy({}, { get: () => () => {}, set: () => true });
  window.HTMLCanvasElement.prototype.getContext = () => dummyCtx;
  window.AudioContext = class {};
  global.Audio = class {
    constructor(src){ this.src = src; }
    cloneNode(){ return new Audio(this.src); }
    play(){ return Promise.reject(Object.assign(new Error('AbortError'), { name: 'AbortError' })); }
    pause(){}
  };
  global.EventBus = { on: (evt, fn) => { if (evt === 'sfx') global._playSfx = fn; } };
  await import(new URL('../dustland-engine.js', import.meta.url));
  const unhandled = [];
  const handler = err => unhandled.push(err);
  process.on('unhandledRejection', handler);
  global._playSfx('step');
  await new Promise(r => setTimeout(r, 100));
  assert.strictEqual(unhandled.length, 0);
  process.off('unhandledRejection', handler);
  dom.window.close();
});
