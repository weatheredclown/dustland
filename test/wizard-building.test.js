import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/supporting/wizard-building.js';

test('building wizard config exists', () => {
  assert.ok(Dustland.BuildingWizard);
  assert.equal(Dustland.BuildingWizard.name, 'BuildingWizard');
});
