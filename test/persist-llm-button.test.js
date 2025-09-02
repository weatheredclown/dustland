import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
const code = full.split('// ===== Boot =====')[0];

test('Persist LLM button hidden until Nano is ready', async () => {
  const document = makeDocument();
  const canvas = document.createElement('canvas');
  canvas.id = 'game';
  document.body.appendChild(document.getElementById('log'));
  document.body.appendChild(document.getElementById('hp'));
  document.body.appendChild(document.getElementById('ap'));
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
  document.body.appendChild(document.getElementById('nanoToggle'));
  document.body.appendChild(document.getElementById('audioToggle'));
  document.body.appendChild(document.getElementById('mobileToggle'));
  document.body.appendChild(document.getElementById('tileCharToggle'));
  const persistBtn = document.getElementById('persistLLM');
  document.body.appendChild(persistBtn);

  const nano = { enabled: false, isReady: () => false, refreshIndicator: () => {} };
  const window = {
    document,
    AudioContext: class {},
    webkitAudioContext: class {},
    HTMLCanvasElement: class {},
    addEventListener: () => {},
    removeEventListener: () => {},
    setTimeout: (fn) => { fn(); return 0; },
    clearTimeout: () => {},
    NanoDialog: nano
  };
  window.HTMLCanvasElement.prototype.getContext = () => ({});

  const context = {
    window,
    document,
    requestAnimationFrame: () => 0,
    setTimeout: (fn) => { fn(); return 0; },
    clearTimeout: () => {},
    AudioContext: window.AudioContext,
    webkitAudioContext: window.webkitAudioContext,
    Audio: class { constructor(){ this.addEventListener = () => {}; } cloneNode(){ return new this.constructor(); } },
    EventBus: { on: () => {}, emit: () => {} },
    NanoDialog: nano,
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

  assert.strictEqual(persistBtn.style.display, 'none');
  document.getElementById('nanoToggle').onclick();
  assert.strictEqual(persistBtn.style.display, 'none');
  nano.isReady = () => true;
  document.getElementById('nanoToggle').onclick();
  document.getElementById('nanoToggle').onclick();
  assert.notStrictEqual(persistBtn.style.display, 'none');
});

