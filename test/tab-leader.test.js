import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('Tab cycles leader without triggering NPC start events', async () => {
  const dom = new JSDOM('<div id="party"></div><div id="combatOverlay"></div><div id="shopOverlay"></div>');
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    overlay: null,
    party: [{ name: 'A', hp: 1 }, { name: 'B', hp: 1 }, { name: 'C', hp: 1 }],
    selectedMember: 0,
    renderParty: () => {},
    toast: () => {},
    move: () => {},
    interact: () => {},
    takeNearestItem: () => {},
    toggleAudio: () => {},
    toggleMobileControls: () => {},
    showTab: () => {},
    NPCS: [{ map: 'world', x: 0, y: 0 }],
    NanoDialog: { queueForNPC: () => { ctx.party.splice(1); } }
  };
  ctx.party.x = 0; ctx.party.y = 0;
  vm.createContext(ctx);
  const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const start = full.indexOf("window.addEventListener('keydown'");
  const handler = full.slice(start, full.indexOf('\n    });', start) + '\n    });'.length);
  vm.runInContext(handler, ctx);
  ctx.window.addEventListener('keydown', e => {
    if (e.key === 'Tab') ctx.NanoDialog.queueForNPC();
  });
  ctx.window.dispatchEvent(new ctx.window.KeyboardEvent('keydown', { key: 'Tab' }));
  assert.equal(ctx.party.length, 3);
  assert.equal(ctx.selectedMember, 1);
});
