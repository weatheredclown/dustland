import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const full = await fs.readFile(new URL('../dustland-engine.js', import.meta.url), 'utf8');

class AudioCtx {
  createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 }, type:'' }; }
  createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){} } }; }
  get destination(){ return {}; }
  resume(){}
  suspend(){}
  get currentTime(){ return 0; }
}

class Audio {
  constructor(){ this.addEventListener = () => {}; }
  cloneNode(){ return new Audio(); }
  play(){ return Promise.resolve(); }
  pause(){}
}

test('keyboard shortcuts toggle audio, mobile controls, and pickup', async () => {
  const html = `<body>
  <div id="log"></div>
  <div id="hp"></div>
  <div id="ap"></div>
  <div id="scrap"></div>
  <canvas id="game"></canvas>
  <button id="saveBtn"></button>
  <button id="loadBtn"></button>
  <button id="resetBtn"></button>
  <button id="nanoToggle"></button>
  <button id="audioToggle"></button>
  <button id="mobileToggle"></button>
  <button id="settingsBtn"></button>
  <div id="settings"><button id="settingsClose"></button></div>
  <div id="panelToggle"></div>
  <div class="panel"></div>
  <div class="tabs"></div>
  <div id="tabInv"></div>
  <div id="tabParty"></div>
  <div id="tabQuests"></div>
  <div id="inv"></div>
  <div id="party"></div>
  <div id="quests"></div>
  <div id="overlay"></div>
  <div id="combatOverlay"></div>
  <div id="moduleLoader"></div>
  </body>`;
  const dom = new JSDOM(html, { url:'https://example.com' });
  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'getContext', { value: () => ({ fillRect(){}, strokeRect(){}, drawImage(){}, clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, save(){}, restore(){}, translate(){}, fillText(){}, globalAlpha:1, font:'' }) });
  dom.window.AudioContext = AudioCtx;
  dom.window.webkitAudioContext = AudioCtx;
  dom.window.Audio = Audio;

  const party = [];
  party.flags = {};
  let takeCalls = 0;
  const context = {
    window: dom.window,
    document: dom.window.document,
    navigator: { userAgent: 'Test' },
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    Audio: Audio,
    EventBus: { on: () => {}, emit: () => {} },
    requestAnimationFrame: () => 0,
    move: () => {},
    interact: () => {},
    showTab: () => {},
    takeNearestItem: () => { takeCalls++; },
    renderParty: () => {},
    toast: () => {},
    NPCS: [],
    party,
    selectedMember: 0,
    state: { map: 'world' },
    player: { hp:10, ap:2, scrap:0 },
    save: () => {},
    load: () => {},
    resetAll: () => {},
    genWorld: () => {},
    buildings: [],
    interiors: {},
    assert: () => {},
    openCreator: () => {},
    closeCreator: () => {},
    startGame: () => {},
    overlay: null,
    handleDialogKey: () => false,
    handleCombatKey: () => false,
    showMini: false,
    console,
    URLSearchParams,
    location: { search:'', hash:'' }
  };
  vm.createContext(context);
  vm.runInContext(full, context);

  const audioBtn = context.document.getElementById('audioToggle');
  const mobileBtn = context.document.getElementById('mobileToggle');
  assert.strictEqual(audioBtn.textContent, 'Audio: On');
  assert.strictEqual(mobileBtn.textContent, 'Mobile Controls: Off');

  dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key:'o' }));
  assert.strictEqual(audioBtn.textContent, 'Audio: Off');

  dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key:'c' }));
  assert.strictEqual(mobileBtn.textContent, 'Mobile Controls: On');

  dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key:'g' }));
  assert.strictEqual(takeCalls, 1);
});
