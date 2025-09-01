// Basic Building Wizard config

globalThis.Dustland = globalThis.Dustland || {};
Dustland.wizards = Dustland.wizards || {};
var step = (Dustland.WizardSteps && Dustland.WizardSteps.tilemapPicker)
  ? [Dustland.WizardSteps.tilemapPicker('Tilemap', ['interior_a.tmx', 'interior_b.tmx'], 'tilemap')]
  : [];
Dustland.wizards.building = {
  name: 'BuildingWizard',
  steps: step,
  commit(state){
    state = state || {};
    const id = (state.tilemap || 'interior').replace(/\.[^/.]+$/, '');
    const building = { id, tilemap: state.tilemap };
    const doors = [
      { from: 'world', to: id, x: state.entry?.x || 0, y: state.entry?.y || 0 },
      { from: id, to: 'world', x: state.exit?.x || 0, y: state.exit?.y || 0 }
    ];
    return { buildings: [building], doors };
  }
};
