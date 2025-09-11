import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { basicDom } from './dom-fixture.js';

const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
const code = full.split('// ===== Boot =====')[0];

class AudioCtx {
  createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 }, type:'' }; }
  createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){} } }; }
  get destination(){ return {}; }
  get currentTime(){ return 0; }
}

const AudioStub = class { constructor(){ this.addEventListener = () => {}; } cloneNode(){ return new AudioStub(); } };

function setup(html){
  const dom = new JSDOM(html);
  dom.window.AudioContext = AudioCtx;
  dom.window.webkitAudioContext = AudioCtx;
  const dummyCtx = new Proxy({}, { get: () => () => {}, set: () => true });
  dom.window.HTMLCanvasElement.prototype.getContext = () => dummyCtx;
  const context = {
    window: dom.window,
    document: dom.window.document,
    requestAnimationFrame: fn => fn(),
    EventBus: { on: () => {}, emit: () => {} },
    fxConfig: {},
    player: { hp: 10, hydration: 2, scrap: 0 },
    leader: () => ({ maxHp: 10 }),
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    Audio: AudioStub,
    NanoDialog: { enabled: true }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context;
}

test('hydration meter shows droplets when not full', () => {
  const html = `<body><canvas id="game"></canvas>${basicDom}<span id="hydrationMeter" hidden></span><div id="hpBar" class="hudbar"><div id="hpGhost"></div><div id="hpFill"></div></div><div id="adrBar" class="hudbar adr"><div id="adrFill"></div></div><div id="statusIcons"></div></body>`;
  const ctx = setup(html);
  ctx.player.hydration = 1;
  ctx.updateHUD();
  const hyd = ctx.document.getElementById('hydrationMeter');
  assert.equal(hyd.textContent, '💧');
  assert.ok(!hyd.hidden);
  ctx.player.hydration = 2;
  ctx.updateHUD();
  assert.ok(hyd.hidden);
});
