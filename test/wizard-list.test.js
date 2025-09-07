import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('all registered wizards appear in list', async () => {
  const document = makeDocument();
  const list = document.getElementById('wizardList');
  document.body.appendChild(list);
  const context = {
    document,
    openWizard(cfg) { context.opened = cfg; },
    Dustland: { wizards: {
      one: { title: 'One', steps: [] },
      two: { title: 'Two', steps: [] }
    } }
  };
  vm.createContext(context);
  let code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  code = code.replace(/\r\n/g, '\n');
  const match = code.match(/const wizardList[\s\S]*?}\n\nfunction mergeWizardResult/);
  vm.runInContext(match[0].replace(/\n\nfunction mergeWizardResult/, ''), context);
  const btns = list.querySelectorAll('button');
  assert.strictEqual(btns.length, 2);
  btns[1].dispatchEvent({ type: 'click' });
  assert.strictEqual(context.opened, context.Dustland.wizards.two);
});
