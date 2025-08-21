import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('mobile buttons are non-selectable and glow on press', async () => {
  const dom = new JSDOM('<body><canvas id="game" width="640" height="480"></canvas><div id="log"></div><div id="hp"></div><div id="ap"></div><div id="scrap"></div></body>');
  global.window = dom.window;
  global.document = dom.window.document;
  const dummyCtx = new Proxy({}, { get: () => () => {}, set: () => true });
  window.HTMLCanvasElement.prototype.getContext = () => dummyCtx;
  global.requestAnimationFrame = () => 0;
  class AudioCtx {
    createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 }, type:'' }; }
    createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){}} }; }
    get destination(){ return {}; }
    get currentTime(){ return 0; }
  }
  global.AudioContext = AudioCtx;
  global.webkitAudioContext = AudioCtx;
  window.AudioContext = AudioCtx;
  window.webkitAudioContext = AudioCtx;
  global.Audio = class { constructor(){ this.addEventListener = () => {}; } };
  global.EventBus = { on: () => {}, emit: () => {} };
  global.NanoDialog = { enabled: true };
  global.location = { hash: '' };
  global.move = () => {};
  global.interact = () => {};
  global.takeNearestItem = () => {};
  const full = await fs.readFile(new URL('../dustland-engine.js', import.meta.url), 'utf8');
  const code = full.split('function sfxTick')[0];
  vm.runInThisContext(code, { filename: 'dustland-engine.js' });
  setMobileControls(true);
  const btn = document.querySelector('button');
  assert.ok(btn);
  assert.strictEqual(btn.style.userSelect, 'none');
  btn.onpointerdown();
  assert.strictEqual(btn.style.boxShadow, '0 0 8px #0f0');
  btn.onpointerup();
  assert.strictEqual(btn.style.boxShadow, 'none');
});

