import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('renderProblems reuses DOM and handler', async () => {
  const dom = new JSDOM('<div id="problemCard"><div id="problemList"></div></div>');
  global.document = dom.window.document;
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const clickCode = code.match(/function onProblemClick\(\){[\s\S]*?\n}\n/)[0];
  const renderCode = code.match(/function renderProblems\(issues\){[\s\S]*?\n}\n/)[0];
  vm.runInThisContext('var problemRefs;\n' + clickCode + renderCode);
  const issues = [{ msg:'Player start on blocked tile', type:'start' }];
  renderProblems(issues);
  const list = document.getElementById('problemList');
  const first = list.firstChild;
  const handler = first.onclick;
  assert.strictEqual(handler, onProblemClick);
  renderProblems(issues);
  assert.strictEqual(list.firstChild, first);
  assert.strictEqual(list.firstChild.onclick, handler);
  delete global.document;
});
