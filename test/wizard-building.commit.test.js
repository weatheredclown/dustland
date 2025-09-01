import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('BuildingWizard commit links doors', async () => {
  const code = await fs.readFile(new URL('../scripts/wizard-building.js', import.meta.url), 'utf8');
  const context = { Dustland: { WizardSteps: {}, wizards: {} } };
  vm.createContext(context);
  vm.runInContext(code, context);
  const commit = context.Dustland.wizards.building.commit;
  const mod = JSON.parse(JSON.stringify(commit({ tilemap: 'interior_a.tmx', entry: { x: 1, y: 2 }, exit: { x: 3, y: 4 } })));
  assert.deepStrictEqual(mod, {
    buildings: [{ id: 'interior_a', tilemap: 'interior_a.tmx' }],
    doors: [
      { from: 'world', to: 'interior_a', x: 1, y: 2 },
      { from: 'interior_a', to: 'world', x: 3, y: 4 }
    ]
  });
});
