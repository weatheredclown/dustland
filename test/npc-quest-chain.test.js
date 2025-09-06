import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

test('NPC serves quest list sequentially', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dir = path.join(__dirname, '..', 'scripts', 'core');
  const npcSrc = fs.readFileSync(path.join(dir, 'npc.js'), 'utf8');
  const questSrc = fs.readFileSync(path.join(dir, 'quests.js'), 'utf8');
  const sandbox = {
    EventBus: { emit: () => {} },
    log: () => {},
    queueNanoDialogForNPCs: () => {},
    countItems: () => 1,
    addToInv: () => {},
    awardXP: () => {},
    party: [],
    textEl: { textContent: '' },
    player: { inv: [], scrap: 0 },
    ITEMS: {},
    state: {},
    CURRENCY: 'sc',
    renderQuests: () => {},
    window: {},
  };
  vm.runInNewContext(npcSrc, sandbox);
  sandbox.queueNanoDialogForNPCs = () => {};
  vm.runInNewContext(questSrc, sandbox);
  const npc = sandbox.makeNPC('test','world',0,0,'#fff','Test','', '', null, null, null, null, {
    quests: [
      new sandbox.Quest('q1', 'Q1', 'd1'),
      new sandbox.Quest('q2', 'Q2', 'd2')
    ]
  });
  npc.processNode('accept');
  assert.strictEqual(sandbox.quests.q1.status, 'active');
  npc.processNode('do_turnin');
  assert.strictEqual(sandbox.quests.q1.status, 'completed');
  assert.ok(npc.quest, 'no next quest');
  assert.strictEqual(npc.quest.id, 'q2');
  npc.processNode('accept');
  assert.strictEqual(sandbox.quests.q2.status, 'active');
});

test('NPC advances quest dialog with quest chain', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dir = path.join(__dirname, '..', 'scripts', 'core');
  const npcSrc = fs.readFileSync(path.join(dir, 'npc.js'), 'utf8');
  const questSrc = fs.readFileSync(path.join(dir, 'quests.js'), 'utf8');
  const sandbox = {
    EventBus: { emit: () => {} },
    log: () => {},
    queueNanoDialogForNPCs: () => {},
    countItems: () => 1,
    addToInv: () => {},
    awardXP: () => {},
    party: [],
    textEl: { textContent: '' },
    player: { inv: [], scrap: 0 },
    ITEMS: {},
    state: {},
    CURRENCY: 'sc',
    renderQuests: () => {},
    window: {},
  };
  vm.runInNewContext(npcSrc, sandbox);
  sandbox.queueNanoDialogForNPCs = () => {};
  vm.runInNewContext(questSrc, sandbox);
  const npc = sandbox.makeNPC('test','world',0,0,'#fff','Test','', '', null, null, null, null, {
    quests: [
      new sandbox.Quest('q1', 'Q1', 'd1'),
      new sandbox.Quest('q2', 'Q2', 'd2')
    ],
    questDialogs: ['Hello Q1', 'Hello Q2']
  });
  assert.strictEqual(npc.tree.start.text, 'Hello Q1');
  npc.processNode('accept');
  npc.processNode('do_turnin');
  assert.strictEqual(npc.tree.start.text, 'Hello Q2');
});
