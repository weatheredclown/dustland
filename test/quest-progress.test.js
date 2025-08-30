import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import fs from 'node:fs/promises';
import vm from 'node:vm';

async function loadRender(ctx){
  const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const start = full.indexOf('function renderQuests');
  const end = full.indexOf('function renderParty');
  vm.runInContext(full.slice(start, end), ctx);
}

test('quest indicator shows item count', async () => {
  const dom = new JSDOM('<div id="quests"></div>');
  const ctx = {
    window: dom.window,
    document: dom.window.document,
    quests: { q1: { id: 'q1', title: 'Collect Stuff', desc: '', status: 'active', item: 'frag', count: 3 } },
    countItems: () => 2
  };
  vm.createContext(ctx);
  await loadRender(ctx);
  ctx.renderQuests();
  const text = dom.window.document.querySelector('.q b').textContent;
  assert.equal(text, 'Collect Stuff (2/3)');
});
