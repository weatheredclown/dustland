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
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    Audio: AudioStub,
    EventBus: { on: () => {}, emit: () => {} },
    NanoDialog: { enabled: true },
    location: { hash: '' },
    move: () => {},
    interact: () => {},
    takeNearestItem: () => {},
    save: () => {},
    load: () => {},
    resetAll: () => {},
    setTimeout,
    clearTimeout,
    console,
    player: { hp: 10, ap: 2, scrap: 0 },
    leader: () => ({ maxHp: 10, adr: 0, maxAdr: 100 }),
    buffs: []
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context;
}

test('hp bar flashes, updates aria values, and body gains critical/out classes', async () => {
  const html = `<body><canvas id="game"></canvas><div id="log"></div><div id="hp"></div><div id="ap"></div><div id="scrap"></div><div id="hpBar" class="hudbar"><div id="hpGhost"></div><div id="hpFill"></div></div><div id="adrBar" class="hudbar adr"><div id="adrFill"></div></div><div id="statusIcons"></div></body>`;
  const ctx = setup(html);
  ctx.updateHUD();
  const bar = ctx.document.getElementById('hpBar');
  assert.equal(bar.getAttribute('aria-valuenow'), '10');
  assert.ok(!ctx.document.body.classList.contains('hp-critical'));
  ctx.player.hp = 2;
  ctx.updateHUD();
  assert.ok(ctx.document.body.classList.contains('hp-critical'));
  assert.equal(bar.getAttribute('aria-valuenow'), '2');
  assert.ok(bar.classList.contains('hurt'));
  ctx.player.hp = 0;
  ctx.updateHUD();
  assert.ok(ctx.document.body.classList.contains('hp-out'));
  const adrBar = ctx.document.getElementById('adrBar');
  assert.equal(adrBar.getAttribute('aria-valuemax'), '100');
});
