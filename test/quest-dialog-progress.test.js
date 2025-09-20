import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreDir = path.join(__dirname, '..', 'scripts', 'core');
const questSrc = fs.readFileSync(path.join(coreDir, 'quests.js'), 'utf8');

test('quest progress increments after visiting dialog node', () => {
  const sandbox = {
    renderQuests: () => {},
    log: () => {},
    toast: () => {},
    EventBus: { emit: () => {} },
    queueNanoDialogForNPCs: () => {},
    countItems: () => 0,
    findItemIndex: () => -1,
    removeFromInv: () => {},
    addToInv: () => {},
    awardXP: () => {},
    party: [],
    textEl: { textContent: '' },
    choicesEl: { innerHTML: '', appendChild: () => {} },
    closeDialog: () => {},
    player: { inv: [], scrap: 0 },
    ITEMS: {},
    state: {},
    document: { createElement: () => ({ className: '', textContent: '', onclick: null }) }
  };
  vm.createContext(sandbox);
  vm.runInContext(questSrc, sandbox);

  const quest = new sandbox.Quest('favor', 'Favor', 'Convince the Duke', {
    count: 1,
    dialogNodes: [{ npcId: 'duke_wastes', nodeId: 'favor_granted' }]
  });
  sandbox.questLog.add(quest);
  assert.equal(quest.status, 'active');
  assert.equal(quest.progress, 0);

  sandbox.trackQuestDialogNode('duke_wastes', 'favor_granted');
  assert.equal(quest.progress, 1);

  // Visiting the same node again should not increase progress beyond the count.
  sandbox.trackQuestDialogNode('duke_wastes', 'favor_granted');
  assert.equal(quest.progress, 1);
});

test('defaultQuestProcessor blocks turn-in until dialog node requirement is met', () => {
  const sandbox = {
    renderQuests: () => {},
    log: () => {},
    toast: () => {},
    EventBus: { emit: () => {} },
    queueNanoDialogForNPCs: () => {},
    countItems: () => 0,
    findItemIndex: () => -1,
    removeFromInv: () => {},
    addToInv: () => {},
    awardXP: () => {},
    party: [],
    textEl: { textContent: '' },
    choicesEl: { innerHTML: '', appendChild: () => {} },
    closeDialog: () => {},
    player: { inv: [], scrap: 0 },
    ITEMS: {},
    state: {},
    document: { createElement: () => ({ className: '', textContent: '', onclick: null }) }
  };
  vm.createContext(sandbox);
  vm.runInContext(questSrc, sandbox);

  const quest = new sandbox.Quest('favor', 'Favor', 'Convince the Duke', {
    count: 1,
    dialogNodes: [{ npcId: 'duke_wastes', nodeId: 'favor_granted' }],
    progressText: 'The Duke has not pledged us his favor yet.'
  });
  sandbox.questLog.add(quest);
  const npc = { quest };

  sandbox.defaultQuestProcessor(npc, 'do_turnin');
  assert.equal(quest.status, 'active');
  assert.equal(sandbox.textEl.textContent, 'The Duke has not pledged us his favor yet.');

  sandbox.trackQuestDialogNode('duke_wastes', 'favor_granted');
  sandbox.textEl.textContent = '';
  sandbox.defaultQuestProcessor(npc, 'do_turnin');
  assert.equal(quest.status, 'completed');
});
