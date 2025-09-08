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

test('panel toggle shows and hides panel', async () => {
  const document = makeDocument();
  const canvas = document.createElement('canvas');
  canvas.id = 'game';
  document.body.appendChild(document.getElementById('log'));
  document.body.appendChild(document.getElementById('hp'));
  document.body.appendChild(document.getElementById('scrap'));
  document.body.appendChild(canvas);
  const panel = document.createElement('div');
  panel.className = 'panel';
  document.body.appendChild(panel);
  const toggleEl = document.getElementById('panelToggle');
  document.body.appendChild(toggleEl);
  document.body.appendChild(document.getElementById('saveBtn'));
  document.body.appendChild(document.getElementById('loadBtn'));
  document.body.appendChild(document.getElementById('resetBtn'));
  document.body.appendChild(document.getElementById('settingsBtn'));
  const settings = document.getElementById('settings');
  document.body.appendChild(settings);
  settings.appendChild(document.getElementById('settingsClose'));
  const window = { document, AudioContext: AudioCtx, webkitAudioContext: AudioCtx, HTMLCanvasElement: class {}, addEventListener:()=>{}, removeEventListener:()=>{} };
  window.HTMLCanvasElement.prototype.getContext = () => ({ });
  const context = {
    window,
    document,
    requestAnimationFrame: () => 0,
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    Audio: class { constructor(){ this.addEventListener = () => {}; } cloneNode(){ return new this.constructor(); } },
    EventBus: { on: () => {}, emit: () => {} },
    NanoDialog: { enabled: true },
    location: { hash: '' },
    move: () => {},
    interact: () => {},
    takeNearestItem: () => {},
    save: () => {},
    load: () => {},
    resetAll: () => {},
    console,
    open: false,
    overlay: { classList: { contains: () => false } }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  const toggle = document.getElementById('panelToggle');
  toggle.onclick();
  assert.ok(panel.classList.contains('show'));
  toggle.onclick();
  assert.ok(!panel.classList.contains('show'));
});

test('b key closes panel on mobile', async () => {
  const document = makeDocument();
  const canvas = document.createElement('canvas');
  canvas.id = 'game';
  document.body.appendChild(document.getElementById('log'));
  document.body.appendChild(document.getElementById('hp'));
  document.body.appendChild(document.getElementById('scrap'));
  document.body.appendChild(canvas);
  const panel = document.createElement('div');
  panel.className = 'panel';
  document.body.appendChild(panel);
  const toggleEl = document.getElementById('panelToggle');
  document.body.appendChild(toggleEl);
  document.body.appendChild(document.getElementById('saveBtn'));
  document.body.appendChild(document.getElementById('loadBtn'));
  document.body.appendChild(document.getElementById('resetBtn'));
  document.body.appendChild(document.getElementById('settingsBtn'));
  const settings = document.getElementById('settings');
  document.body.appendChild(settings);
  settings.appendChild(document.getElementById('settingsClose'));
  let keyHandler;
  const window = { document, AudioContext: AudioCtx, webkitAudioContext: AudioCtx, HTMLCanvasElement: class {}, addEventListener:(type,fn)=>{ if(type==='keydown') keyHandler=fn; }, removeEventListener:()=>{} };
  window.HTMLCanvasElement.prototype.getContext = () => ({ });
  const context = {
    window,
    document,
    requestAnimationFrame: () => 0,
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    Audio: class { constructor(){ this.addEventListener = () => {}; } cloneNode(){ return new this.constructor(); } },
    EventBus: { on: () => {}, emit: () => {} },
    NanoDialog: { enabled: true },
    location: { hash: '' },
    move: () => {},
    interact: () => {},
    takeNearestItem: () => {},
    save: () => {},
    load: () => {},
    resetAll: () => {},
    console,
    open: false,
    overlay: { classList: { contains: () => false } }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  const toggle = document.getElementById('panelToggle');
  toggle.onclick();
  assert.ok(panel.classList.contains('show'));
  context.setMobileControls(true);
  keyHandler({ key: 'b', preventDefault(){}, stopImmediatePropagation(){} });
  assert.ok(!panel.classList.contains('show'));
});
