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
