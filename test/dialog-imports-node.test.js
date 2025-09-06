import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

function extract(code, name) {
  let start = code.indexOf(`function ${name}`);
  if (start >= 0) {
    let depth = 0; let end = start;
    for (; end < code.length; end++) {
      if (code[end] === '{') depth++;
      else if (code[end] === '}') { depth--; if (!depth) { end++; break; } }
    }
    return code.slice(start, end);
  }
  start = code.indexOf(`const ${name}`);
  if (start >= 0) {
    const end = code.indexOf('\n', code.indexOf('};', start)) + 1;
    return code.slice(start, end);
  }
  return '';
}

test('renderTreeEditor skips imports and keeps required item', async () => {
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const dom = new JSDOM('<div id="treeEditor"></div><textarea id="npcTree"></textarea>');
  const ctx = {
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
    populateTemplateDropdown: () => {},
  };
  ctx.globalThis = ctx;
  const snippets = [
    extract(code, 'populateItemDropdown'),
    'function refreshChoiceDropdowns(){var sel=document.querySelector(\'.choiceReqItem\'); if(sel) populateItemDropdown(sel, sel.dataset.sel || sel.value);}',
    'function addChoiceRow(container, ch = {}) { const row = document.createElement("div"); row.innerHTML = "<label>Label<input class=\\"choiceLabel\\" value=\\"" + (ch.label || "") + "\\"/></label><label>To<select class=\\"choiceTo\\"></select></label><details class=\\"choiceAdv\\"><summary>Advanced</summary><div class=\\"advOptions\\"></div></details>"; container.appendChild(row); if (ch.reqItem) { const div = document.createElement("div"); div.dataset.adv = "req"; div.innerHTML = "<label>Req Item<select class=\\"choiceReqItem\\"></select></label>"; row.querySelector(".advOptions").appendChild(div); const sel = div.querySelector(".choiceReqItem"); sel.dataset.sel = ch.reqItem; } refreshChoiceDropdowns(); }',
    extract(code, 'renderTreeEditor'),
    extract(code, 'setTreeData'),
    extract(code, 'getTreeData'),
  ].join('\n');
  vm.createContext(ctx);
  vm.runInContext(snippets, ctx);
  ctx.setTreeData({
    start: { text: 'hi', choices: [{ label: 'open', to: 'bye', reqItem: 'key' }] },
    imports: { flags: [], items: ['key'], events: [], queries: [] }
  });
  ctx.renderTreeEditor();
  const ids = [...ctx.document.querySelectorAll('.nodeId')].map(i => i.value);
  assert.deepStrictEqual(ids, ['start']);
  const reqSel = ctx.document.querySelector('.choiceReqItem');
  assert.ok(reqSel);
  assert.strictEqual(reqSel.dataset.sel, 'key');
});
