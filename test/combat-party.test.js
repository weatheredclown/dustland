import assert from 'node:assert';
import { test } from 'node:test';
await import('../scripts/core/party.js');

// ensure combat preserves party roster
// we need DOM before importing combat

const { JSDOM } = await import('jsdom');
const dom = new JSDOM(`<div id="combatOverlay"></div><div id="combatEnemies"></div><div id="combatParty"></div><div id="combatCmd"></div><div id="turnIndicator"></div>`);
global.document = dom.window.document;
global.window = dom.window;

await import('../scripts/core/combat.js');

test('party roster restores after combat', async () => {
  globalThis.party.length = 0;
  globalThis.player = { hp: 10, inv: [] };
  globalThis.updateHUD = () => {};
  globalThis.renderParty = () => {};
  const a = globalThis.makeMember('a', 'A', 'Hero');
  const b = globalThis.makeMember('b', 'B', 'Mage');
  globalThis.party.push(a, b);
  const before = Array.from(globalThis.party, m => m.id);

  const p = globalThis.openCombat([]);
  globalThis.party.splice(1, 1); // drop B
  globalThis.party.push(a); // duplicate A
  globalThis.closeCombat('win');
  await p;

  assert.deepStrictEqual(Array.from(globalThis.party, m => m.id), before);
});
