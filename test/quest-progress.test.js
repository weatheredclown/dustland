import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import fs from 'node:fs/promises';
import vm from 'node:vm';

async function loadRender(ctx) {
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

test('quest progress combines turned-in and carried items', async () => {
  const dom = new JSDOM('<div id="quests"></div>');
  installCanvasStub(dom);
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    quests: {
      q1: {
        id: 'q1',
        title: 'Collect Stuff',
        desc: '',
        status: 'active',
        item: 'frag',
        count: 3,
        progress: 1
      }
    },
    countItems: () => 1,
    itemDrops: [],
    ITEMS: { frag: { id: 'frag', name: 'Fragment', tags: [] } },
    party: { x: 0, y: 0, map: 'world' },
    state: { map: 'world' }
  };
  vm.createContext(ctx);
  await loadRender(ctx);
  ctx.renderQuests();
  const progress = dom.window.document.querySelector('.quest-progress').textContent;
  assert.equal(progress, '2/3');
});

test('quest description changes when objective ready to turn in', async () => {
  const dom = new JSDOM('<div id="quests"></div>');
  installCanvasStub(dom);
  const quest = {
    id: 'q_valve',
    title: 'Water for the Pump',
    desc: 'Find the Valve.',
    status: 'active',
    item: 'valve',
    count: 1,
    givers: [{ id: 'pump', name: 'Nila the Pump-Keeper', map: 'world', x: 10, y: 10 }]
  };
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    quests: { q_valve: quest },
    countItems: () => 1,
    itemDrops: [],
    ITEMS: { valve: { id: 'valve', name: 'Valve', tags: [] } },
    party: { x: 0, y: 0, map: 'world' },
    state: { map: 'world' }
  };
  vm.createContext(ctx);
  await loadRender(ctx);
  ctx.renderQuests();
  const desc = dom.window.document.querySelector('.quest-desc').textContent;
  assert.equal(desc, 'Return the Valve to Nila the Pump-Keeper.');
  const target = dom.window.document.querySelector('.quest-target').textContent;
  assert.equal(target, 'Return to Nila the Pump-Keeper');
});
