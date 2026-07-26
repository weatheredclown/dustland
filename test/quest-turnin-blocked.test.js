import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreDir = path.join(__dirname, '..', 'scripts', 'core');

const dialogSrc = fs.readFileSync(path.join(coreDir, 'dialog.js'), 'utf8');
const questsSrc = fs.readFileSync(path.join(coreDir, 'quests.js'), 'utf8');

test('dialog advances correctly and closes when quest turn-in is blocked', () => {
  const sandbox = {
    renderQuests: () => {},
    log: () => {},
    toast: () => {},
    GAME_STATE: { DIALOG: 'DIALOG', WORLD: 'WORLD', INTERIOR: 'INTERIOR' },
    EventBus: { emit: () => {} },
    queueNanoDialogForNPCs: () => {},
    countItems: () => 5, // We have 5 items
    findItemIndex: () => 0,
    removeFromInv: () => {},
    addToInv: () => {},
    awardXP: () => {},
    party: [],
    textEl: { textContent: '' },
    choicesEl: { innerHTML: '', appendChild: function(c) { this.children.push(c); }, children: [], classList: { toggle: () => {} } },
    overlay: { classList: { add: () => {}, remove: () => {} } },
    closeDialog: () => {
        sandbox.isClosed = true;
    },
    player: { inv: [{id: 'rat_tail', count: 5}], scrap: 0 },
    ITEMS: { rat_tail: { name: 'Rat Tail' } },
    state: {},
    document: {
        createElement: () => ({ className: '', textContent: '', onclick: null }),
        getElementById: (id) => {
            if (id === 'choices') return sandbox.choicesEl;
            if (id === 'dialogText') return sandbox.textEl;
            if (id === 'overlay') return sandbox.overlay;
            return { children: [], classList: { add: () => {}, remove: () => {} }, style: {} };
        }
    }
  };
  vm.createContext(sandbox);

  vm.runInContext(questsSrc, sandbox);
  vm.runInContext(dialogSrc, sandbox);

  const quest = {
    id: 'rat_problem',
    status: 'active',
    item: 'rat_tail',
    count: 10, // require 10, only have 5
    dialog: { turnIn: { text: "Thanks!" } }
  };
  sandbox.questLog.add(quest);

  const npc = {
    id: 'giver',
    quest: quest,
    tree: { start: { text: "Hello", next: [] } }
  };

  sandbox.openDialog(npc);

  const choice = sandbox.dialogState.tree['start'].next.find(opt => opt.q === 'turnin');
  const idx = sandbox.dialogState.tree['start'].next.indexOf(choice);
  const result = sandbox.advanceDialog(sandbox.dialogState, idx);

  assert.equal(result.close, true, 'AdvanceDialog should return close: true when quest is blocked');
  assert.equal(result.text, 'That’s 5/10. Keep going.', 'Should return the blocked message text');
});
