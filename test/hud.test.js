import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { basicDom } from './dom-fixture.js';

const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
const code = full.split('// ===== Boot =====')[0];
const fxCode = await fs.readFile(new URL('../scripts/fx-config.js', import.meta.url), 'utf8');

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
    player: { hp: 10, scrap: 0 },
    leader: () => ({ maxHp: 10, adr: 0, maxAdr: 100 }),
    buffs: []
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  vm.runInContext(fxCode, context);
  return context;
}

const HUD_HTML = `<body><canvas id="game"></canvas>${basicDom}<div id="hpBar" class="hudbar"><div id="hpGhost"></div><div id="hpFill"></div></div><div id="adrBar" class="hudbar adr"><div id="adrFill"></div></div><div id="statusIcons"></div></body>`;

test('hp bar flashes, updates aria values, and body gains critical/out classes', async () => {
  const ctx = setup(HUD_HTML);
  ctx.fxConfig.damageFlash = true;
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

test('damage flash disabled by default but can be enabled', async () => {
  const ctx = setup(HUD_HTML);
  ctx.updateHUD();
  ctx.player.hp = 5;
  ctx.updateHUD();
  const bar = ctx.document.getElementById('hpBar');
  assert.ok(!bar.classList.contains('hurt'));
  ctx.fxConfig.damageFlash = true;
  ctx.player.hp = 4;
  ctx.updateHUD();
  assert.ok(bar.classList.contains('hurt'));
});

test('adrenaline tint and grayscale filters update based on config', async () => {
  const ctx = setup(HUD_HTML);
  ctx.fxConfig.adrenalineTint = true;
  ctx.leader = () => ({ maxHp: 10, adr: 50, maxAdr: 100 });
  ctx.updateHUD();
  const filt1 = ctx.document.getElementById('game').style.getPropertyValue('--fxFilter');
  assert.ok(/saturate/.test(filt1));
  ctx.fxConfig.grayscale = true;
  ctx.updateHUD();
  const filt2 = ctx.document.getElementById('game').style.getPropertyValue('--fxFilter');
  assert.ok(/grayscale/.test(filt2));
});

test('adrenaline pulse updates player fx with adr ratio', async () => {
  const ctx = setup(HUD_HTML);
  ctx.fxConfig.adrenalineTint = true;
  ctx.leader = () => ({ maxHp: 10, adr: 50, maxAdr: 100 });
  ctx.pulseAdrenaline(0);
  assert.ok(ctx.playerAdrenalineFx.intensity > 0);
  assert.ok(ctx.playerAdrenalineFx.scale > 1);
  assert.ok(ctx.playerAdrenalineFx.hueShift > 0);
  ctx.leader = () => ({ maxHp: 10, adr: 0, maxAdr: 100 });
  ctx.pulseAdrenaline(0);
  assert.equal(ctx.playerAdrenalineFx.intensity, 0);
  assert.equal(ctx.playerAdrenalineFx.scale, 1);
  assert.equal(ctx.playerAdrenalineFx.hueShift, 0);
});

test('adrenaline pulse ignores hp when active', async () => {
  const ctx = setup(HUD_HTML);
  ctx.fxConfig.adrenalineTint = true;
  ctx.leader = () => ({ maxHp: 10, hp: 10, adr: 50, maxAdr: 100 });
  ctx.pulseAdrenaline(0);
  const healthyFx = { ...ctx.playerAdrenalineFx };
  ctx.leader = () => ({ maxHp: 10, hp: 3, adr: 50, maxAdr: 100 });
  ctx.pulseAdrenaline(0);
  assert.equal(ctx.playerAdrenalineFx.intensity, healthyFx.intensity);
  assert.equal(ctx.playerAdrenalineFx.scale, healthyFx.scale);
  assert.equal(ctx.playerAdrenalineFx.hueShift, healthyFx.hueShift);
  assert.equal(ctx.playerAdrenalineFx.glow, healthyFx.glow);
});
