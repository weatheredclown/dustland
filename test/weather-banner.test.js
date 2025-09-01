import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('weather banner updates on weather change', async () => {
  const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const code = full.split('// ===== Boot =====')[0];
  const dom = new JSDOM('<body><div id="weatherBanner" hidden></div><div id="log"></div><div id="hp"></div><div id="ap"></div><div id="scrap"></div><div id="hpBar"><div id="hpGhost"></div><div id="hpFill"></div></div><div id="adrBar"><div id="adrFill"></div></div><div id="statusIcons"></div><canvas id="game"></canvas></body>');
  const bus = { handlers:{}, on(evt,fn){ (this.handlers[evt]=this.handlers[evt]||[]).push(fn); }, emit(evt,p){ (this.handlers[evt]||[]).forEach(fn=>fn(p)); } };
  function AudioCtx(){}
  dom.window.AudioContext = AudioCtx;
  dom.window.webkitAudioContext = AudioCtx;
  class AudioStub { constructor(){ this.addEventListener = () => {}; } cloneNode(){ return new AudioStub(); } }
  dom.window.Audio = AudioStub;
  const dummyCtx = new Proxy({}, { get: () => () => {}, set: () => true });
  dom.window.HTMLCanvasElement.prototype.getContext = () => dummyCtx;
  const context = {
    window: dom.window,
    document: dom.window.document,
    EventBus: bus,
    requestAnimationFrame: fn => fn(),
    console,
    Audio: AudioStub,
    player: { hp: 10, ap: 2, scrap: 0 },
    leader: () => ({ maxHp:10, adr:0, maxAdr:100 }),
    Dustland: { weather: { getWeather: () => ({ state: 'clear', icon: '☀️', desc: 'Clear' }) } },
    NanoDialog: { enabled: true }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  bus.emit('weather:change', { state: 'dust', icon: '☁️', desc: 'Dust storm' });
  const banner = dom.window.document.getElementById('weatherBanner');
  assert.strictEqual(banner.textContent, '☁️ Dust storm');
  assert.strictEqual(banner.hidden, false);
});
