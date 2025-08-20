import assert from 'node:assert';
import test from 'node:test';

// Setup minimal DOM and globals
const noop = () => {};

global.window = globalThis;
global.document = { getElementById: () => null };

global.NPCS = [{
  id: 'npc1',
  name: 'Scrap Dealer',
  title: 'Trader',
  desc: '',
  map: 'world',
  tree: {
    start: { text: 'Greetings', choices: [] }
  }
}];

global.resolveNode = (tree, id) => {
  const n = tree[id];
  if (!n) return null;
  return { ...n, choices: n.choices || [] };
};

global.party = [{ name: 'Hero', stats: { STR: 5 } }];
global.selectedMember = 0;
global.player = { inv: [] };
global.quests = {};
global.toast = noop;

global.LanguageModel = {
  availability: async () => 'available',
  create: async () => ({
    prompt: async () => `Lines:\nRust bites every gear, but we endure.\nKeep your scrap dry.\nNever trade hope for rust.\nChoices:\nAsk about wares|Got anything rare?\nInspect the stall|INT|8|XP 5|You spot a hidden coil.|You find only dust.\n`
  })
};

test('NanoDialog generates lines and choices', async () => {
  await import('../dustland-nano.js');
  await window.NanoDialog.init();
  window.NanoDialog.queueForNPC(NPCS[0], 'start', 'test');
  await new Promise(r => setTimeout(r, 100));
  const lines = window.NanoDialog.linesFor('npc1', 'start');
  const choices = window.NanoDialog.choicesFor('npc1', 'start');
  assert.ok(Array.isArray(lines) && lines.length > 0, 'lines generated');
  assert.ok(Array.isArray(choices) && choices.length === 2, 'choices generated');
  assert.strictEqual(choices[0].response, 'Got anything rare?');
  assert.strictEqual(choices[1].check.stat, 'INT');
  assert.strictEqual(choices[1].reward, 'XP 5');
});

test('NanoDialog skips missing dialog nodes', async () => {
  await import('../dustland-nano.js');
  await window.NanoDialog.init();
  window.NanoDialog.queueForNPC(NPCS[0], 'bogus', 'test');
  await new Promise(r => setTimeout(r, 100));
  const lines = window.NanoDialog.linesFor('npc1', 'bogus');
  const choices = window.NanoDialog.choicesFor('npc1', 'bogus');
  assert.deepStrictEqual(lines, []);
  assert.deepStrictEqual(choices, []);
});
