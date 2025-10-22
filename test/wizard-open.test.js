import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('openWizard commits results and Enter triggers next', async () => {
  const document = makeDocument();
  ['wizardModal','wizardBody','wizardTitle','wizardNext','wizardPrev','closeWizard'].forEach(id => {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
  });
  const context = { document, window: { document }, Dustland: {}, applyModule(data){ context.applied = data; }, WORLD_H: 10 };
  vm.createContext(context);
  let code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  code = code.replace(/\r\n/g, '\n');
  const moduleMatch = code.match(/const moduleData =[\s\S]*?\}\);/);
  const mergeMatch = code.match(/function mergeWizardResult[\s\S]*?}\s*(?=function openWizard)/);
  const openMatch = code.match(/function openWizard[\s\S]*?}\s*(?=function animate)/);
  vm.runInContext(moduleMatch[0] + '\n' + mergeMatch[0] + openMatch[0], context);
  let nextCalls = 0;
  context.Dustland.Wizard = (container, steps, opts) => ({
    next() { nextCalls++; opts.onComplete({ npcs: [{ id: 'n' }] }); },
    prev() {}
  });
  context.openWizard({ title: 't', steps: [], commit: s => s });
  const body = document.getElementById('wizardBody');
  const input = document.createElement('input');
  body.appendChild(input);
  body.dispatchEvent({ type: 'keydown', key: 'Enter', target: input, preventDefault(){} });
  assert.strictEqual(nextCalls, 1);
  assert.strictEqual(context.moduleData.npcs.length, 1);
  assert.strictEqual(context.applied, context.moduleData);
});
