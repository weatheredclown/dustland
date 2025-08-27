import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('Tab cycles leader without triggering NPC start events', async () => {
  const dom = new JSDOM('<div id="party"></div>');
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    state: { map: 'world' },
    party: [{ name: 'A', hp: 1 }, { name: 'B', hp: 1 }, { name: 'C', hp: 1 }],
    selectedMember: 0,
    renderParty: () => {},
    toast: () => {},
    NPCS: [{ map: 'world', x: 0, y: 0 }],
    NanoDialog: { queueForNPC: () => { ctx.party.splice(1); } }
  };
  ctx.party.x = 0; ctx.party.y = 0;
  vm.createContext(ctx);
  const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const start = full.indexOf("case 'Tab':") + "case 'Tab':".length;
  const end = full.indexOf('break;', start);
  vm.runInContext(`function handleTab(e){${full.slice(start, end)}}`, ctx);
  ctx.handleTab({ preventDefault: () => {} });
  assert.equal(ctx.party.length, 3);
});
