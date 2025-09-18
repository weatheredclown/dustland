import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
const code = full.split('// ===== Boot =====')[0];

class AudioCtx {
  createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 }, type:'' }; }
  createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){} } }; }
  get destination(){ return {}; }
  get currentTime(){ return 0; }
}

test('font scale slider updates CSS variable and localStorage', async () => {
  const document = makeDocument();
  const localStore = new Map();
  const localStorage = {
    getItem: key => (localStore.has(key) ? localStore.get(key) : null),
    setItem: (key, value) => { localStore.set(key, value); }
  };
  const window = {
    document,
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    HTMLCanvasElement: class {},
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  window.HTMLCanvasElement.prototype.getContext = () => ({ });
  const context = {
    window,
    document,
    requestAnimationFrame: () => 0,
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    Audio: class { constructor(){ this.addEventListener = () => {}; } cloneNode(){ return new this.constructor(); } },
    EventBus: { on: () => {}, emit: () => {} },
    Dustland: { eventBus: { on: () => {}, emit: () => {} } },
    NanoDialog: { enabled: true },
    location: { hash: '' },
    move: () => {},
    interact: () => {},
    takeNearestItem: () => {},
    save: () => {},
    load: () => {},
    resetAll: () => {},
    console,
    localStorage,
    globalThis: null
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(code, context);

  const initialScale = document.body.style.getPropertyValue('--font-scale');
  assert.strictEqual(initialScale, '1');
  const slider = document.getElementById('fontScale');
  slider.value = '1.5';
  slider.dispatchEvent({ type: 'input' });
  const updated = document.body.style.getPropertyValue('--font-scale');
  assert.strictEqual(updated, '1.5');
  const readout = document.getElementById('fontScaleValue');
  assert.strictEqual(readout.textContent, '150%');
  assert.strictEqual(localStore.get('fontScale'), '1.5');
});
