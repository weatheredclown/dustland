import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('BuildingWizard commit links doors', async () => {
  const code = await fs.readFile(new URL('../scripts/wizard-building.js', import.meta.url), 'utf8');
  const context = { Dustland: { WizardSteps: {}, wizards: {} } };
  vm.createContext(context);
  vm.runInContext(code, context);
  const commit = context.Dustland.BuildingWizard.commit;
  const mod = JSON.parse(JSON.stringify(commit({
    room1: 'interior_a.tmx',
    room2: 'interior_b.tmx',
    entry: { x: 1, y: 2 },
    exit: { x: 3, y: 4 },
    room1door: { x: 5, y: 6 },
    room2door: { x: 7, y: 8 }
  })));
  assert.deepStrictEqual(mod, {
    buildings: [
      { id: 'interior_a', tilemap: 'interior_a.tmx' },
      { id: 'interior_b', tilemap: 'interior_b.tmx' }
    ],
    doors: [
      { from: 'world', to: 'interior_a', x: 1, y: 2 },
      { from: 'interior_a', to: 'world', x: 3, y: 4 },
      { from: 'interior_a', to: 'interior_b', x: 5, y: 6 },
      { from: 'interior_b', to: 'interior_a', x: 7, y: 8 }
    ]
  });
});

test('commit tolerates missing door links', async () => {
  const code = await fs.readFile(new URL('../scripts/wizard-building.js', import.meta.url), 'utf8');
  const context = { Dustland: { WizardSteps: {}, wizards: {} } };
  vm.createContext(context);
  vm.runInContext(code, context);
  const commit = context.Dustland.wizards.building.commit;
  assert.doesNotThrow(() => commit({ tilemap: 'a.tmx', entry: { x: 1, y: 2 } }));
});
