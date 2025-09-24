import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import fs from 'node:fs/promises';
import vm from 'node:vm';

async function loadQuestHelpers(ctx) {
  const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const start = full.indexOf('function renderQuests');
  const end = full.indexOf('function renderParty');
  vm.runInContext(full.slice(start, end), ctx);
}

function installCanvasStub(dom) {
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    arc() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    set lineWidth(_) {},
    set strokeStyle(_) {},
    set fillStyle(_) {}
  });
}

test('quest UI uses map display names', async () => {
  const dom = new JSDOM('<div id="quests"></div>');
  installCanvasStub(dom);
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    mapLabel: id => {
      if (id === 'stonegate') return 'Stonegate';
      if (id === 'maw_depths') return 'Maw Depths';
      return '';
    },
    mapLabels: {},
    itemDrops: [],
    quests: {},
    party: [],
    state: {},
    requestAnimationFrame: fn => (typeof fn === 'function' ? fn() : undefined)
  };
  vm.createContext(ctx);
  await loadQuestHelpers(ctx);

  const itemTarget = { type: 'item', map: 'stonegate', x: 2, y: 3, label: 'Signal Beacon' };
  const targetText = ctx.questTargetText(itemTarget, { map: 'world', x: 0, y: 0 });
  assert.strictEqual(targetText, 'Search near Signal Beacon (2, 3) — Stonegate');

  const desc = ctx.questDescriptionText({ status: 'active', desc: '' }, { ready: false }, { type: 'offmap', map: 'maw_depths' });
  assert.strictEqual(desc, 'Objective located in Maw Depths.');

  const tooltip = ctx.questCompassTooltip({ type: 'item', label: 'Signal Beacon', map: 'stonegate' }, { map: 'world' });
  assert.strictEqual(tooltip, 'Search near Signal Beacon (Stonegate)');
});
