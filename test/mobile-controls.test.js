import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const full = await fs.readFile(new URL('../dustland-engine.js', import.meta.url), 'utf8');
const code = full.split('function sfxTick')[0];

class AudioCtx {
  createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 }, type:'' }; }
  createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){} } }; }
  get destination(){ return {}; }
  get currentTime(){ return 0; }
}

async function setup(html, extras={}){
  const dom = new JSDOM(html);
  dom.window.AudioContext = AudioCtx;
  dom.window.webkitAudioContext = AudioCtx;
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
    console,
    ...extras
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return { dom, context };
}

test('mobile buttons are non-selectable and glow on press', async () => {
  const { context } = await setup('<body><canvas id="game" width="640" height="480"></canvas><div id="log"></div><div id="hp"></div><div id="ap"></div><div id="scrap"></div></body>');
  context.setMobileControls(true);
  const btn = context.document.querySelector('button');
  assert.ok(btn);
  assert.strictEqual(btn.style.userSelect, 'none');
  btn.onpointerdown();
  assert.strictEqual(btn.style.boxShadow, '0 0 8px #0f0');
  btn.onpointerup();
  assert.strictEqual(btn.style.boxShadow, 'none');
});

test('mobile arrows navigate dialog when overlay shown', async () => {
  const keys=[];
  const html = '<body><div id="overlay" class="shown"></div><canvas id="game"></canvas><div id="log"></div><div id="hp"></div><div id="ap"></div><div id="scrap"></div></body>';
  const { dom, context } = await setup(html, {
    handleDialogKey: e => { keys.push(e.key); return true; },
    move: () => { keys.push('move'); },
    overlay: null
  });
  context.overlay = dom.window.document.getElementById('overlay');
  context.setMobileControls(true);
  const up = [...context.document.querySelectorAll('button')].find(b => b.textContent === '↑');
  up.onclick();
  const down = [...context.document.querySelectorAll('button')].find(b => b.textContent === '↓');
  down.onclick();
  assert.deepStrictEqual(keys, ['ArrowUp', 'ArrowDown']);
});

test('mobile arrows navigate combat menu when in combat', async () => {
  const keys=[];
  const html = '<body><div id="combatOverlay" class="shown"></div><canvas id="game"></canvas><div id="log"></div><div id="hp"></div><div id="ap"></div><div id="scrap"></div></body>';
  const { context } = await setup(html, {
    handleCombatKey: e => { keys.push(e.key); return true; },
    move: () => { keys.push('move'); },
    overlay: null
  });
  context.setMobileControls(true);
  const up = [...context.document.querySelectorAll('button')].find(b => b.textContent === '↑');
  up.onclick();
  const down = [...context.document.querySelectorAll('button')].find(b => b.textContent === '↓');
  down.onclick();
  assert.deepStrictEqual(keys, ['ArrowUp', 'ArrowDown']);
});

test('mobile A selects combat option when in combat', async () => {
  const keys = [];
  const html = '<body><div id="combatOverlay" class="shown"></div><canvas id="game"></canvas><div id="log"></div><div id="hp"></div><div id="ap"></div><div id="scrap"></div></body>';
  const { context } = await setup(html, {
    handleCombatKey: e => { keys.push(e.key); return true; },
    interact: () => { keys.push('interact'); },
    overlay: null
  });
  context.setMobileControls(true);
  const a = [...context.document.querySelectorAll('button')].find(b => b.textContent === 'A');
  a.onclick();
  assert.deepStrictEqual(keys, ['Enter']);
});
