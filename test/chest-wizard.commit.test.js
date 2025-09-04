import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('ChestWizard commit builds module data', async () => {
  const document = makeDocument();
  const container = document.getElementById('w');
  document.body.appendChild(container);
  const context = { window: { document }, document };
  vm.createContext(context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const stepFiles = ['text.js', 'map-placement.js', 'confirm.js'];
  for (const f of stepFiles) {
    const code = await fs.readFile(new URL('../components/wizard/steps/' + f, import.meta.url), 'utf8');
    vm.runInContext(code, context);
  }
  const chestCode = await fs.readFile(new URL('../components/wizard/chest-wizard.js', import.meta.url), 'utf8');
  vm.runInContext(chestCode, context);
  const cfg = context.Dustland.ChestWizard;
  const mod = JSON.parse(JSON.stringify(cfg.commit({
    name: 'Dusty Chest',
    keyName: 'Chest Key',
    lootName: 'Gold Coin',
    chestPos: { x: 1, y: 2 },
    keyPos: { x: 3, y: 4 }
  })));
  assert.deepStrictEqual(mod, {
    items: [
      { map: 'world', x: 3, y: 4, id: 'dusty_chest_key', name: 'Chest Key', type: 'quest', tags: ['key'] },
      { id: 'dusty_chest_loot', name: 'Gold Coin', type: 'quest' }
    ],
    npcs: [
      {
        id: 'dusty_chest',
        map: 'world',
        x: 1,
        y: 2,
        color: '#ddf',
        name: 'Dusty Chest',
        symbol: '?',
        locked: true,
        tree: {
          locked: {
            text: 'A locked chest sits here.',
            choices: [
              { label: '(Use Key)', to: 'open', once: true, reqItem: 'dusty_chest_key', effects: [ { effect: 'unlockNPC', npcId: 'dusty_chest' } ] },
              { label: '(Leave)', to: 'bye' }
            ]
          },
          open: {
            text: 'The chest creaks open, revealing Gold Coin.',
            choices: [
              { label: '(Take Gold Coin)', to: 'empty', reward: 'dusty_chest_loot', effects: [ { effect: 'addFlag', flag: 'dusty_chest_looted' } ] }
            ]
          },
          empty: {
            text: 'The chest is empty.',
            choices: [
              { label: '(Lock Chest)', to: 'locked_empty', reqItem: 'dusty_chest_key', effects: [ { effect: 'lockNPC', npcId: 'dusty_chest' } ] },
              { label: '(Leave)', to: 'bye' }
            ]
          },
          locked_empty: {
            text: 'The chest is empty and locked.',
            choices: [
              { label: '(Leave)', to: 'bye' }
            ]
          }
        }
      }
    ]
  });
});
