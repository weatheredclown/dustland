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
  mkSelect(document, 'npcQuests', []);
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

test('collectNPCFromForm reads loot chance', async () => {
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
  mkCheckbox(document, 'npcCombat', true);
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
  mkInput(document, 'npcLoot', 'rat_tail');
  mkInput(document, 'npcLootChance', '25');
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
    gatherLoopFields() { return []; }
  };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('function collectNPCFromForm');
  const end = code.indexOf('// Add a new NPC', start);
  vm.runInContext(code.slice(start, end), context);

  const npc = context.collectNPCFromForm();
  assert.strictEqual(npc.combat.lootChance, 0.25);
});

test('collectNPCFromForm reads workbench checkbox', async () => {
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
  mkCheckbox(document, 'npcWorkbench', false);
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
    gatherLoopFields() { return []; }
  };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('function collectNPCFromForm');
  const end = code.indexOf('// Add a new NPC', start);
  vm.runInContext(code.slice(start, end), context);

  const npc1 = context.collectNPCFromForm();
  assert.ok(!('workbench' in npc1));

  document.getElementById('npcWorkbench').checked = true;
  const npc2 = context.collectNPCFromForm();
  assert.strictEqual(npc2.workbench, true);
});

test('collectEncounter reads loot chance', async () => {
  const document = makeDocument();
  mkInput(document, 'encMap', 'world');
  mkInput(document, 'encTemplate', 't');
  mkInput(document, 'encMinDist', '0');
  mkInput(document, 'encMaxDist', '0');
  const lootTable = document.getElementById('encLootTable');
  const row = document.createElement('div');
  row.className = 'lootRow';
  const itemSel = document.createElement('select');
  itemSel.className = 'lootItemSelect';
  itemSel.value = 'rat_tail';
  const chanceInput = document.createElement('input');
  chanceInput.className = 'lootChanceInput';
  chanceInput.value = '30';
  row.appendChild(itemSel);
  row.appendChild(chanceInput);
  lootTable.appendChild(row);
  const context = { document, moduleData: { templates: [] } };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('function clampChance');
  const end = code.indexOf('function addEncounter', start);
  vm.runInContext(code.slice(start, end), context);
  const e = context.collectEncounter();
  assert.ok(Array.isArray(e.lootTable));
  const drops = JSON.parse(JSON.stringify(e.lootTable));
  assert.deepStrictEqual(drops, [{ item: 'rat_tail', chance: 0.3 }]);
});

test('collectTemplate reads loot chance', async () => {
  const document = makeDocument();
  mkInput(document, 'templateId', 't');
  mkInput(document, 'templateName', 'T');
  mkTextarea(document, 'templateDesc', '');
  mkInput(document, 'templateColor', '#fff');
  mkInput(document, 'templatePortrait', '');
  mkInput(document, 'templateHP', '5');
  mkInput(document, 'templateATK', '1');
  mkInput(document, 'templateDEF', '0');
  mkInput(document, 'templateChallenge', '0');
  mkInput(document, 'templateSpecialCue', '');
  mkInput(document, 'templateSpecialDmg', '0');
  const lootTable = document.getElementById('templateLootTable');
  const row = document.createElement('div');
  row.className = 'lootRow';
  const itemSel = document.createElement('select');
  itemSel.className = 'lootItemSelect';
  itemSel.value = 'rat_tail';
  const chanceInput = document.createElement('input');
  chanceInput.className = 'lootChanceInput';
  chanceInput.value = '10';
  row.appendChild(itemSel);
  row.appendChild(chanceInput);
  lootTable.appendChild(row);
  mkInput(document, 'templateRequires', '');
  const context = { document };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('function clampChance');
  const end = code.indexOf('function addTemplate', start);
  vm.runInContext(code.slice(start, end), context);
  const t = context.collectTemplate();
  assert.ok(Array.isArray(t.combat.lootTable));
  const drops = JSON.parse(JSON.stringify(t.combat.lootTable));
  assert.deepStrictEqual(drops, [{ item: 'rat_tail', chance: 0.1 }]);
  assert.ok(!('challenge' in t.combat));
});

test('collectTemplate clamps challenge to 1-10', async () => {
  const document = makeDocument();
  mkInput(document, 'templateId', 't');
  mkInput(document, 'templateName', 'T');
  mkTextarea(document, 'templateDesc', '');
  mkInput(document, 'templateColor', '#fff');
  mkInput(document, 'templatePortrait', '');
  mkInput(document, 'templateHP', '5');
  mkInput(document, 'templateATK', '1');
  mkInput(document, 'templateDEF', '0');
  mkInput(document, 'templateChallenge', '42');
  mkInput(document, 'templateSpecialCue', '');
  mkInput(document, 'templateSpecialDmg', '0');
  document.getElementById('templateLootTable');
  mkInput(document, 'templateRequires', '');
  const context = { document };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('function clampChance');
  const end = code.indexOf('function addTemplate', start);
  vm.runInContext(code.slice(start, end), context);
  const t = context.collectTemplate();
  assert.strictEqual(t.combat.challenge, 10);
  assert.ok(!('lootTable' in t.combat));
});

