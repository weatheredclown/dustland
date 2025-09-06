import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
function extract(fnName) {
  const start = code.indexOf(`function ${fnName}`);
  let depth = 0; let end = start;
  for (; end < code.length; end++) {
    if (code[end] === '{') depth++;
    else if (code[end] === '}') { depth--; if (!depth) { end++; break; } }
  }
  return code.slice(start, end);
}
const popItemCode = extract('populateItemDropdown');
const refreshCode = extract('refreshChoiceDropdowns');
const addChoiceCode = 'function addChoiceRow(container, ch = {}) { const row = document.createElement("div"); row.innerHTML = "<label>Label<input class=\\"choiceLabel\\" value=\\"" + (ch.label || "") + "\\"/></label><label>To<select class=\\"choiceTo\\"></select></label><details class=\\"choiceAdv\\"><summary>Advanced</summary><div class=\\"advOptions\\"></div></details>"; container.appendChild(row); if (ch.reqItem) { const div = document.createElement("div"); div.dataset.adv = "req"; div.innerHTML = "<label>Req Item<select class=\\"choiceReqItem\\"></select></label>"; row.querySelector(".advOptions").appendChild(div); const sel = div.querySelector(".choiceReqItem"); sel.dataset.sel = ch.reqItem; } refreshChoiceDropdowns(); }';
const renderTreeCode = extract('renderTreeEditor');
const setTreeCode = extract('setTreeData');
const getTreeCode = extract('getTreeData');

test('refreshChoiceDropdowns restores preset required item', () => {
  const dom = new JSDOM('<select class="choiceReqItem"></select>');
  const context = {
    window: dom.window,
    document: dom.window.document,
    moduleData: { items: [{ id: 'key' }] },
    populateChoiceDropdown: () => {},
    populateStatDropdown: () => {},
    populateSlotDropdown: () => {},
    populateNPCDropdown: () => {},
    populateRoleDropdown: () => {},
    populateMapDropdown: () => {},
    populateInteriorDropdown: () => {}
  };
  vm.createContext(context);
  vm.runInContext(popItemCode + refreshCode, context);
  const sel = context.document.querySelector('select');
  sel.dataset.sel = 'key';
  context.refreshChoiceDropdowns();
  assert.strictEqual(sel.value, 'key');
});

test('renderTreeEditor repopulates required item dropdown', () => {
  const dom = new JSDOM('<div id="treeEditor"></div><textarea id="npcTree"></textarea>');
  const context = {
    window: dom.window,
    document: dom.window.document,
    moduleData: { items: [{ id: 'key' }], npcs: [], interiors: [], templates: [] },
    editNPCIdx: -1,
    confirmDialog: () => {},
    updateTreeData: () => {},
    populateChoiceDropdown: () => {},
    populateStatDropdown: () => {},
    populateSlotDropdown: () => {},
    populateNPCDropdown: () => {},
    populateRoleDropdown: () => {},
    populateMapDropdown: () => {},
    populateInteriorDropdown: () => {},
    populateTemplateDropdown: () => {}
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext([popItemCode, refreshCode, addChoiceCode, renderTreeCode, setTreeCode, getTreeCode].join('\n'), context);
  context.setTreeData({ start: { text: 'hi', choices: [{ label: 'open', to: 'bye', reqItem: 'key' }] } });
  context.renderTreeEditor();
  const sel = context.document.querySelector('.choiceReqItem');
  assert.ok(sel);
  assert.strictEqual(sel.value, 'key');
  assert.ok(sel.querySelector('option[value="key"]'));
});
