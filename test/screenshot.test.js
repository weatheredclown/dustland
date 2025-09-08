import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
const code = full.split('// ===== Boot =====')[0];

test('screenshot button downloads image', async () => {
  const document = makeDocument();
  const canvas = document.getElementById('game');
  let captured = false;
  canvas.toDataURL = () => { captured = true; return 'data:image/png;base64,x'; };
  ['log','hp','scrap','saveBtn','loadBtn','resetBtn','settingsBtn','screenshotBtn','settingsClose'].forEach(id => {
    document.body.appendChild(document.getElementById(id));
  });
  const panel = document.createElement('div');
  panel.className = 'panel';
  document.body.appendChild(panel);
  const toggleEl = document.getElementById('panelToggle');
  document.body.appendChild(toggleEl);
  const settings = document.getElementById('settings');
  document.body.appendChild(settings);
  settings.appendChild(document.getElementById('settingsClose'));
  let link;
  document.createElement = tag => {
    if (tag === 'a') {
      link = { href: '', download: '', click() { this.clicked = true; } };
      return link;
    }
    return makeDocument().createElement(tag);
  };
  const window = { document, AudioContext: class {}, webkitAudioContext: class {}, HTMLCanvasElement: class {}, addEventListener:()=>{}, removeEventListener:()=>{} };
  window.HTMLCanvasElement.prototype.getContext = () => ({});
  const context = {
    window,
    document,
    requestAnimationFrame: () => 0,
    AudioContext: class {},
    webkitAudioContext: class {},
    Audio: class { constructor(){ this.addEventListener=()=>{}; } cloneNode(){ return new this.constructor(); } },
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
    overlay: { classList: { contains: () => false } },
    toggleAudio: () => {},
    toggleMobileControls: () => {},
    toggleTileChars: () => {},
    setAudio: () => {},
    setMobileControls: () => {},
    setTileChars: () => {},
    toast: () => {},
    UI: { hide: () => {}, show: () => {} },
    log: () => {}
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  const btn = document.getElementById('screenshotBtn');
  btn.hidden = true;
  assert.ok(btn.hidden, 'button hidden by default');
  btn.onclick();
  assert.ok(captured, 'canvas toDataURL called');
  assert.ok(link && link.download === 'dustland.png' && link.clicked, 'download triggered');
});
