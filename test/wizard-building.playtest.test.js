import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('building wizard links rooms', async () => {
  const code = await fs.readFile(new URL('../scripts/wizard-building.js', import.meta.url), 'utf8');
  const context = { Dustland: { WizardSteps: {}, wizards: {} } };
  vm.createContext(context);
  vm.runInContext(code, context);
  const mod = context.Dustland.BuildingWizard.commit({
    room1: 'interior_a.tmx',
    room2: 'interior_b.tmx',
    entry: { x: 1, y: 2 },
    exit: { x: 3, y: 4 },
    room1door: { x: 5, y: 6 },
    room2door: { x: 7, y: 8 }
  });
  const link = mod.doors.find(d => d.from === 'interior_a' && d.to === 'interior_b');
  assert.ok(link);
});
