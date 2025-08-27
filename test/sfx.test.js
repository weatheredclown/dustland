import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

async function setup(playImpl = () => Promise.resolve()) {
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
  window.AudioContext = class { suspend() {} resume() {} };
  let plays = 0;
  const audios = [];
  global.Audio = class {
    constructor(src){ this.src = src; this.isPlaying = false; audios.push(this); }
    cloneNode(){ return new Audio(this.src); }
    play(){ plays++; this.isPlaying = true; return playImpl(); }
    pause(){ this.isPlaying = false; }
  };
  global.EventBus = { on: (evt, fn) => { if (evt === 'sfx') global._playSfx = fn; } };
  await import(new URL('../scripts/dustland-engine.js?' + Math.random(), import.meta.url));
  const cleanup = () => dom.window.close();
  return {
    cleanup,
    getPlays: () => plays,
    getPlaying: () => audios.filter(a => a.isPlaying).length,
    getAudioCount: () => audios.length,
  };
}

test('playSfx handles aborted play without unhandled rejection', async () => {
  const { cleanup } = await setup(() => Promise.reject(Object.assign(new Error('AbortError'), { name: 'AbortError' })));
  const unhandled = [];
  const handler = err => unhandled.push(err);
  process.on('unhandledRejection', handler);
  global._playSfx('step');
  await new Promise(r => setTimeout(r, 100));
  assert.strictEqual(unhandled.length, 0);
  process.off('unhandledRejection', handler);
  cleanup();
});

test('toggleAudio prevents playback', async () => {
  const { cleanup, getPlays } = await setup();
  toggleAudio();
  global._playSfx('step');
  assert.strictEqual(getPlays(), 0);
  cleanup();
});

test('playSfx reuses a pool of five audio elements', async () => {
  const { cleanup, getAudioCount, getPlays } = await setup();
  for (let i = 0; i < 7; i++) global._playSfx('step');
  assert.strictEqual(getPlays(), 7);
  assert.strictEqual(getAudioCount(), 6);
  cleanup();
});

test('damage sfx uses oscillator without creating audio elements', async () => {
  const { cleanup, getAudioCount, getPlays } = await setup();
  const before = getAudioCount();
  global._playSfx('damage');
  assert.strictEqual(getAudioCount(), before);
  assert.strictEqual(getPlays(), 0);
  cleanup();
});
