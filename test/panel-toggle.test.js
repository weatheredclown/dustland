import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const full = await fs.readFile(new URL('../dustland-engine.js', import.meta.url), 'utf8');
const code = full.split('// ===== Boot =====')[0];

class AudioCtx {
  createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 }, type:'' }; }
  createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){} } }; }
  get destination(){ return {}; }
  get currentTime(){ return 0; }
}

test('panel toggle shows and hides panel', async () => {
  const html = `<body><div id="log"></div><div id="hp"></div><div id="ap"></div><div id="scrap"></div><canvas id="game"></canvas><div class="panel"></div><div id="panelToggle"></div><button id="saveBtn"></button><button id="loadBtn"></button><button id="resetBtn"></button><button id="settingsBtn"></button><div id="settings"><button id="settingsClose"></button></div></body>`;
  const dom = new JSDOM(html);
  dom.window.AudioContext = AudioCtx;
  dom.window.webkitAudioContext = AudioCtx;
  const dummyCtx = new Proxy({}, { get: () => () => {}, set: () => true });
  dom.window.HTMLCanvasElement.prototype.getContext = () => dummyCtx;
  const context = {
    window: dom.window,
    document: dom.window.document,
    requestAnimationFrame: () => 0,
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    Audio: class { constructor(){ this.addEventListener = () => {}; } },
    EventBus: { on: () => {}, emit: () => {} },
    NanoDialog: { enabled: true },
    location: { hash: '' },
    move: () => {},
    interact: () => {},
    takeNearestItem: () => {},
    save: () => {},
    load: () => {},
    resetAll: () => {},
    console
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  const toggle = context.document.getElementById('panelToggle');
  const panel = context.document.querySelector('.panel');
  toggle.click();
  assert.ok(panel.classList.contains('show'));
  toggle.click();
  assert.ok(!panel.classList.contains('show'));
});
