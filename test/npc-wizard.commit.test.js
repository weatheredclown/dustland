import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('NpcWizard commit builds module data', async () => {
  const document = makeDocument();
  const container = document.getElementById('w');
  document.body.appendChild(container);
  const context = { window: { document }, document };
  vm.createContext(context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const stepFiles = ['text.js', 'asset-picker.js', 'item-picker.js', 'map-placement.js', 'confirm.js'];
  for (const f of stepFiles) {
    const code = await fs.readFile(new URL('../components/wizard/steps/' + f, import.meta.url), 'utf8');
    vm.runInContext(code, context);
  }
  const npcCode = await fs.readFile(new URL('../components/wizard/npc-wizard.js', import.meta.url), 'utf8');
  vm.runInContext(npcCode, context);
  const cfg = context.Dustland.NpcWizard;
  const mod = JSON.parse(JSON.stringify(cfg.commit({
    name: 'Bob',
    portrait: 'p.png',
    prompt: 'rusted scavenger',
    dialogue: 'Hi',
    questItem: 'widget',
    pos: { x: 1, y: 2 }
  })));
  assert.deepStrictEqual(mod, {
    npcs: [{
      id: 'bob',
      name: 'Bob',
      portrait: 'p.png',
      prompt: 'rusted scavenger',
      tree: { start: { text: 'Hi', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      map: 'world',
      x: 1,
      y: 2
    }],
    quests: [{ id: 'bob_quest', giver: 'bob', item: 'widget' }]
  });
});
