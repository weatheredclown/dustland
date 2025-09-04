import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

function mkInput(document, id, value = '') {
  const el = document.createElement('input');
  el.id = id;
  el.value = value;
  document.body.appendChild(el);
  return el;
}

function mkCheckbox(document, id, checked = false) {
  const el = document.createElement('input');
  el.type = 'checkbox';
  el.id = id;
  el.checked = checked;
  document.body.appendChild(el);
  return el;
}

function mkTextarea(document, id, value = '') {
  const el = document.createElement('textarea');
  el.id = id;
  el.value = value;
  document.body.appendChild(el);
  return el;
}

test('collectNPCFromForm uses patrol checkbox for loops', async () => {
  const document = makeDocument();
  // required fields with minimal values
  mkInput(document, 'npcId', 'n');
  mkInput(document, 'npcName', 'Name');
  mkInput(document, 'npcTitle', '');
  mkTextarea(document, 'npcDesc', '');
  mkInput(document, 'npcColor', '#fff');
  mkInput(document, 'npcSymbol', '!');
  mkInput(document, 'npcMap', 'world');
  mkInput(document, 'npcX', '0');
  mkInput(document, 'npcY', '0');
  mkTextarea(document, 'npcDialog', 'hi');
  mkInput(document, 'npcQuest', '');
  mkTextarea(document, 'npcAccept', '');
  mkTextarea(document, 'npcTurnin', '');
  mkCheckbox(document, 'npcCombat', false);
  mkCheckbox(document, 'npcShop', false);
  mkInput(document, 'shopMarkup', '2');
  mkCheckbox(document, 'npcHidden', false);
  mkCheckbox(document, 'npcLocked', false);
  mkCheckbox(document, 'npcPortraitLock', true);
  mkInput(document, 'npcOp', '>=');
  mkInput(document, 'npcVal', '1');
  mkTextarea(document, 'npcTree', '');
  mkInput(document, 'npcHP', '5');
  mkInput(document, 'npcATK', '0');
  mkInput(document, 'npcDEF', '0');
  mkInput(document, 'npcLoot', '');
  mkCheckbox(document, 'npcBoss', false);
  mkInput(document, 'npcSpecialCue', '');
  mkInput(document, 'npcSpecialDmg', '');
  mkInput(document, 'npcSpecialDelay', '');
  mkCheckbox(document, 'npcPatrol', false);

  const context = {
    document,
    npcPortraitPath: '',
    npcPortraitIndex: 0,
    npcPortraits: [],
    updateTreeData() {},
    applyCombatTree() {},
    removeCombatTree() {},
    loadTreeEditor() {},
    getRevealFlag() { return ''; },
    gatherLoopFields() { return [{ x: 0, y: 0 }, { x: 1, y: 0 }]; }
  };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('function collectNPCFromForm');
  const end = code.indexOf('// Add a new NPC', start);
  vm.runInContext(code.slice(start, end), context);

  const npc1 = context.collectNPCFromForm();
  assert.ok(!('loop' in npc1));

  document.getElementById('npcPatrol').checked = true;
  const npc2 = context.collectNPCFromForm();
  assert.deepStrictEqual(npc2.loop, [{ x: 0, y: 0 }, { x: 1, y: 0 }]);
});

