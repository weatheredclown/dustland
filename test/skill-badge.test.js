import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const partyCode = await fs.readFile(new URL('../core/party.js', import.meta.url), 'utf8');
const engineCode = await fs.readFile(new URL('../dustland-engine.js', import.meta.url), 'utf8');

function setup(){
  const html = `<body><div id="log"></div><span id="hp"></span><span id="ap"></span><span id="scrap"></span><canvas id="game"></canvas><div class="tabs"></div><div id="inv"></div><div id="party"></div><div id="quests"></div><div id="tabInv"></div><div id="tabParty"></div><div id="tabQuests"></div></body>`;
  const dom = new JSDOM(html);
  const AudioCtx = class { resume(){} suspend(){} };
  dom.window.AudioContext = AudioCtx;
  dom.window.webkitAudioContext = AudioCtx;
  dom.window.Audio = class { constructor(){ } cloneNode(){ return new dom.window.Audio(); } play(){} pause(){} };
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({});
  dom.window.NanoDialog = { enabled: true, init: () => {} };
  dom.window.requestAnimationFrame = () => 0;
  dom.window.cancelAnimationFrame = () => {};
  dom.window.URLSearchParams = class { constructor(){ } get(){ return null; } };
  const context = {
    window: dom.window,
    document: dom.window.document,
    player: { hp:10, ap:2, scrap:0 },
    EventBus: { emit: () => {}, on: () => {} },
    unequipItem: () => {},
    log: () => {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    showStart: () => {},
    openCreator: () => {},
    AudioContext: AudioCtx,
    webkitAudioContext: AudioCtx,
    Audio: dom.window.Audio,
    NanoDialog: dom.window.NanoDialog,
    requestAnimationFrame: dom.window.requestAnimationFrame,
    cancelAnimationFrame: dom.window.cancelAnimationFrame,
    URLSearchParams: dom.window.URLSearchParams,
    location: dom.window.location,
  };
  vm.createContext(context);
  vm.runInContext(partyCode, context);
  vm.runInContext(engineCode, context);
  return { context, dom };
}

test('renders skill point badge when points available', () => {
  const { context, dom } = setup();
  const m = context.makeMember('id','Name','Role');
  m.skillPoints = 2;
  context.party.push(m);
  context.renderParty();
  const badge = dom.window.document.querySelector('.spbadge');
  assert.ok(badge, 'badge exists');
  assert.strictEqual(badge.textContent, '2');
});

test('no badge when no skill points', () => {
  const { context, dom } = setup();
  const m = context.makeMember('id','Name','Role');
  context.party.push(m);
  context.renderParty();
  const badge = dom.window.document.querySelector('.spbadge');
  assert.strictEqual(badge, null);
});
