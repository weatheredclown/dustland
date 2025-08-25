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

function setup(party){
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
  party.flags = {};
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
    takeNearestItem: () => {},
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
    location: { search:'', hash:'' },
    statLine: () => '',
    xpToNext: () => 100,
    unequipItem: () => {}
  };
  vm.createContext(context);
  vm.runInContext(full, context);
  return { context, dom };
}

test('party panels handle click and focus selection', async () => {
  const party = [
    { name:'A', role:'Hero', lvl:1, hp:5, maxHp:5, ap:2, skillPoints:0, stats:{}, equip:{ weapon:null, armor:null, trinket:null}, _bonus:{}, portraitSheet:null, xp:0 },
    { name:'B', role:'Mage', lvl:1, hp:5, maxHp:5, ap:2, skillPoints:0, stats:{}, equip:{ weapon:null, armor:null, trinket:null}, _bonus:{}, portraitSheet:null, xp:0 }
  ];
  const { context, dom } = setup(party);

  context.renderParty();
  const partyDiv = dom.window.document.getElementById('party');
  assert.strictEqual(partyDiv.querySelectorAll('.pcard').length, 2);
  assert.strictEqual(partyDiv.querySelector('input[type="radio"]'), null);

  partyDiv.children[1].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.strictEqual(context.selectedMember, 1);
  assert(partyDiv.children[1].classList.contains('selected'));

  partyDiv.children[0].focus();
  assert.strictEqual(context.selectedMember, 0);
  assert(partyDiv.children[0].classList.contains('selected'));
});

test('renderParty shows single frame from sprite sheet', () => {
  const party = [
    { name:'Grin', role:'NPC', lvl:1, hp:5, maxHp:5, ap:2, skillPoints:0, stats:{}, equip:{ weapon:null, armor:null, trinket:null}, _bonus:{}, portraitSheet:'assets/portraits/grin_4.png', xp:0 }
  ];
  const { context, dom } = setup(party);
  context.renderParty();
  const portrait = dom.window.document.querySelector('.portrait');
  assert.ok(portrait.style.backgroundImage.includes('grin_4.png'));
  assert.strictEqual(portrait.style.backgroundSize, '200% 200%');
  assert.strictEqual(portrait.style.backgroundPosition, '0% 0%');
});
