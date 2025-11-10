import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

function mkInput(document, id, value = '') {
  const el = document.getElementById(id);
  el.value = value;
  document.body.appendChild(el);
  return el;
}

function mkSelect(document, id, values = []) {
  const el = document.getElementById(id);
  el.multiple = true;
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.selected = true;
    el.appendChild(opt);
  });
  document.body.appendChild(el);
  return el;
}

function mkCheckbox(document, id, checked = false) {
  const el = document.getElementById(id);
  el.type = 'checkbox';
  el.checked = checked;
  document.body.appendChild(el);
  return el;
}

function mkTextarea(document, id, value = '') {
  const el = document.getElementById(id);
  el.value = value;
  document.body.appendChild(el);
  return el;
}

test('collectNPCFromForm captures trainer type', async () => {
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
  mkSelect(document, 'npcQuests', []);
  mkTextarea(document, 'npcAccept', '');
  mkTextarea(document, 'npcTurnin', '');
  mkCheckbox(document, 'npcCombat', false);
  mkCheckbox(document, 'npcShop', false);
  mkInput(document, 'shopMarkup', '2');
  mkInput(document, 'shopRefresh', '0');
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
  mkInput(document, 'npcLootChance', '100');
  mkCheckbox(document, 'npcBoss', false);
  mkInput(document, 'npcSpecialCue', '');
  mkInput(document, 'npcSpecialDmg', '');
  mkInput(document, 'npcSpecialDelay', '');
  mkCheckbox(document, 'npcPatrol', false);
  mkCheckbox(document, 'npcTrainer', false);
  mkInput(document, 'npcTrainerType', 'power');

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
    gatherLoopFields() { return []; }
  };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('function collectNPCFromForm');
  let end = code.indexOf('function saveNPC', start);
  if (end === -1) end = code.length;
  vm.runInContext(code.slice(start, end), context);

  const npc1 = context.collectNPCFromForm();
  assert.ok(!('trainer' in npc1));

  document.getElementById('npcTrainer').checked = true;
  document.getElementById('npcTrainerType').value = 'tricks';
  const npc2 = context.collectNPCFromForm();
  assert.strictEqual(npc2.trainer, 'tricks');
});

