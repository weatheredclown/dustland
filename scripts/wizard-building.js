// Basic Building Wizard config

globalThis.Dustland = globalThis.Dustland || {};
Dustland.wizards = Dustland.wizards || {};
var step = (Dustland.WizardSteps && Dustland.WizardSteps.tilemapPicker)
  ? [Dustland.WizardSteps.tilemapPicker('Tilemap', ['interior_a.tmx', 'interior_b.tmx'], 'tilemap')]
  : [];
Dustland.wizards.building = {
  name: 'BuildingWizard',
  steps: step,
  commit(){ /* placeholder */ }
};
