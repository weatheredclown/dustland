import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { JSDOM } from 'jsdom';

test('camp:open heals party and shows persona menu', async () => {
  const dom = new JSDOM('<!doctype html><body><button id="campBtn"></button><div class="overlay" id="personaOverlay"><div class="persona-window"><div id="personaList" class="persona-list"></div><button id="closePersonaBtn" class="btn"></button></div></div></body>', { pretendToBeVisual: true });
  const { document } = dom.window;
  const bus = new EventEmitter();
  let healed = false;
  let msg = '';
  let applied = '';
  const healAll = () => { healed = true; };
  const log = m => { msg = m; };
  const gs = {
    getState: () => ({ party: [{ id: 'p1', name: 'Hero' }], personas: { a: { label: 'Mask A', portraitPrompt: 'AI prompt text', mods: { STR: 2, AGI: -1 } } } }),
    applyPersona: (pid, id) => { applied = id; }
  };
  const party = [{ id: 'p1', name: 'Hero', hydration: 0 }];
  party.x = 0; party.y = 0;
  const state = { map: 'world' };
  const sandbox = {
    EventBus: bus,
    Dustland: { gameState: gs, zoneEffects: [] },
    document,
    healAll,
    log,
    party,
    state,
    updateHUD: () => {}
  };
  sandbox.globalThis = sandbox;
  const code = await fs.readFile(new URL('../scripts/camp-persona.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  bus.emit('camp:open');
  assert.ok(healed);
  assert.equal(party[0].hydration, 2);
  assert.equal(msg, 'You rest until healed.');
  const overlay = document.getElementById('personaOverlay');
  assert.ok(overlay.classList.contains('shown'));
  const listText = document.getElementById('personaList').textContent;
  assert.match(listText, /AI prompt text/);
  assert.match(listText, /\+2 STR/);
  assert.match(listText, /-1 AGI/);
  const modsEl = document.querySelector('.persona-mods');
  assert.ok(modsEl);
  const btn = document.querySelector('#personaList .btn');
  assert.ok(btn);
  btn.click();
  assert.equal(applied, 'a');
  assert.ok(!overlay.classList.contains('shown'));
});

test('camp:open allows unequipping persona', async () => {
  const dom = new JSDOM('<!doctype html><body><div class="overlay" id="personaOverlay"><div class="persona-window"><div id="personaList" class="persona-list"></div><button id="closePersonaBtn" class="btn"></button></div></div></body>', { pretendToBeVisual: true });
  const { document } = dom.window;
  const bus = new EventEmitter();
  let healed = false;
  let cleared = false;
  const healAll = () => { healed = true; };
  const gs = {
    getState: () => ({ party: [{ id: 'p1', name: 'Hero', persona: 'a' }], personas: { a: { label: 'Mask A' } } }),
    applyPersona: () => {},
    clearPersona: () => { cleared = true; }
  };
  const party = [{ id: 'p1', name: 'Hero', hydration: 0, persona: 'a' }];
  party.x = 0; party.y = 0;
  const state = { map: 'world' };
  const sandbox = {
    EventBus: bus,
    Dustland: { gameState: gs, zoneEffects: [] },
    document,
    healAll,
    log: () => {},
    party,
    state,
    updateHUD: () => {}
  };
  sandbox.globalThis = sandbox;
  const code = await fs.readFile(new URL('../scripts/camp-persona.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  bus.emit('camp:open');
  assert.ok(healed);
  const overlay = document.getElementById('personaOverlay');
  assert.ok(overlay.classList.contains('shown'));
  const unequip = document.querySelector('[data-action="unequip"]');
  assert.ok(unequip);
  const equippedBtn = document.querySelector('[data-persona-id="a"]');
  assert.ok(equippedBtn?.disabled);
  unequip.click();
  assert.ok(cleared);
  assert.ok(!overlay.classList.contains('shown'));
});

test('camp:open shows message when no personas', async () => {
  const dom = new JSDOM('<!doctype html><body><div class="overlay" id="personaOverlay"><div class="persona-window"><div id="personaList" class="persona-list"></div><button id="closePersonaBtn" class="btn"></button></div></div></body>', { pretendToBeVisual: true });
  const { document } = dom.window;
  const bus = new EventEmitter();
  let healed = false;
  const healAll = () => { healed = true; };
  const gs = {
    getState: () => ({ party: [{ id: 'p1', name: 'Hero' }], personas: {} }),
    applyPersona: () => {}
  };
  const party = [{ id: 'p1', name: 'Hero', hydration: 0 }];
  party.x = 0; party.y = 0;
  const state = { map: 'world' };
  const sandbox = {
    EventBus: bus,
    Dustland: { gameState: gs, zoneEffects: [] },
    document,
    healAll,
    log: () => {},
    party,
    state,
    updateHUD: () => {}
  };
  sandbox.globalThis = sandbox;
  const code = await fs.readFile(new URL('../scripts/camp-persona.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  bus.emit('camp:open');
  assert.ok(healed);
  const overlay = document.getElementById('personaOverlay');
  assert.ok(overlay.classList.contains('shown'));
  const btn = document.querySelector('#personaList .btn');
  assert.ok(!btn);
  assert.match(document.getElementById('personaList').textContent, /No masks/);
});

test('camp:open blocked in dry or damaging zones', async () => {
  const dom = new JSDOM('<!doctype html><body><div class="overlay" id="personaOverlay"><div class="persona-window"><div id="personaList" class="persona-list"></div><button id="closePersonaBtn" class="btn"></button></div></div></body>', { pretendToBeVisual: true });
  const { document } = dom.window;
  const bus = new EventEmitter();
  let healed = false;
  let msg = '';
  const healAll = () => { healed = true; };
  const log = m => { msg = m; };
  const gs = {
    getState: () => ({ party: [{ id: 'p1', name: 'Hero' }], personas: {} }),
    applyPersona: () => {}
  };
  const party = [{ id: 'p1', name: 'Hero', hydration: 1 }];
  party.x = 0; party.y = 0;
  const state = { map: 'world' };
  const sandbox = {
    EventBus: bus,
    Dustland: { gameState: gs, zoneEffects: [] },
    document,
    healAll,
    log,
    party,
    state,
    updateHUD: () => {}
  };
  sandbox.globalThis = sandbox;
  const code = await fs.readFile(new URL('../scripts/camp-persona.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  const zones = sandbox.Dustland.zoneEffects;

  zones.push({ map: 'world', x: 0, y: 0, w: 1, h: 1, dry: true });
  bus.emit('camp:open');
  assert.ok(!healed);
  assert.equal(party[0].hydration, 1);
  assert.equal(msg, "You can't camp here.");
  assert.ok(!document.getElementById('personaOverlay').classList.contains('shown'));

  zones[0] = { map: 'world', x: 0, y: 0, w: 1, h: 1, perStep: { hp: -1 } };
  healed = false; msg = '';
  bus.emit('camp:open');
  assert.ok(!healed);
  assert.equal(party[0].hydration, 1);
  assert.equal(msg, "You can't camp here.");
});

test('camp:open toggles fast travel button and opens map', async () => {
  const dom = new JSDOM('<!doctype html><body><div class="overlay" id="personaOverlay"><div class="persona-window"><div id="personaList" class="persona-list"></div><div class="persona-actions"><button id="campFastTravelBtn" class="btn"></button><button id="closePersonaBtn" class="btn"></button></div></div></div></body>', { pretendToBeVisual: true });
  const { document } = dom.window;
  const bus = new EventEmitter();
  const gs = {
    getState: () => ({ party: [{ id: 'p1', name: 'Hero' }], personas: {} }),
    applyPersona: () => {}
  };
  const party = [{ id: 'p1', name: 'Hero', hydration: 0 }];
  party.x = 0; party.y = 0;
  const state = { map: 'world' };
  const opened = [];
  const sandbox = {
    EventBus: bus,
    Dustland: { gameState: gs, zoneEffects: [], bunkers: [] },
    document,
    healAll: () => {},
    log: () => {},
    openWorldMap: id => opened.push(id),
    party,
    state,
    updateHUD: () => {}
  };
  sandbox.globalThis = sandbox;
  const code = await fs.readFile(new URL('../scripts/camp-persona.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  const overlay = document.getElementById('personaOverlay');
  const fastBtn = document.getElementById('campFastTravelBtn');
  bus.emit('camp:open');
  assert.ok(overlay.classList.contains('shown'));
  assert.ok(fastBtn.disabled);
  sandbox.Dustland.bunkers.push({ id: 'alpha', active: true });
  bus.emit('camp:open');
  assert.ok(!fastBtn.disabled);
  fastBtn.click();
  assert.ok(!overlay.classList.contains('shown'));
  assert.deepEqual(opened, ['camp']);
});
