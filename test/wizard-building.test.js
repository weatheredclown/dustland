import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/wizard-building.js';

test('building wizard config exists', () => {
  assert.ok(Dustland.wizards.building);
  assert.equal(Dustland.wizards.building.name, 'BuildingWizard');
});
