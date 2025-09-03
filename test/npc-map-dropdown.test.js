import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('populateMapDropdown lists maps and selects current', async () => {
  const document = makeDocument();
  const sel = document.createElement('select');
  document.body.appendChild(sel);
  const context = { document, moduleData: { interiors: [{ id: 'room1' }, { id: 'room2' }] } };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('function populateMapDropdown');
  const end = code.indexOf('function populateInteriorDropdown', start);
  vm.runInContext(code.slice(start, end), context);
  context.populateMapDropdown(sel, 'room2');
  assert.ok(sel.innerHTML.includes('<option value="world">world</option>'));
  assert.ok(sel.innerHTML.includes('<option value="room1">room1</option>'));
  assert.ok(sel.innerHTML.includes('<option value="room2">room2</option>'));
  assert.strictEqual(sel.value, 'room2');
});
