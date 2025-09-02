// Building Wizard config

globalThis.Dustland = globalThis.Dustland || {};
Dustland.wizards = Dustland.wizards || {};
var steps = [];
if (Dustland.WizardSteps) {
  if (Dustland.WizardSteps.tilemapPicker) {
    steps.push(Dustland.WizardSteps.tilemapPicker('Room 1 Map', ['interior_a.tmx', 'interior_b.tmx'], 'room1'));
    steps.push(Dustland.WizardSteps.tilemapPicker('Room 2 Map', ['interior_a.tmx', 'interior_b.tmx'], 'room2'));
  }
  if (Dustland.WizardSteps.doorLinker) {
    steps.push(Dustland.WizardSteps.doorLinker('entry', 'exit', 'World Entry', 'Room 1 Exit'));
    steps.push(Dustland.WizardSteps.doorLinker('room1door', 'room2door', 'Room 1 Door', 'Room 2 Door'));
  }
  if (Dustland.WizardSteps.confirm) {
    steps.push(Dustland.WizardSteps.confirm('Done'));
  }
}
const BuildingWizard = {
  name: 'BuildingWizard',
  title: 'Building Wizard',
  steps,
  commit(state){
    state = state || {};
    const id1 = (state.room1 || 'interior').replace(/\.[^/.]+$/, '');
    const id2 = (state.room2 || 'interior2').replace(/\.[^/.]+$/, '');
    const buildings = [
      { id: id1, tilemap: state.room1 },
      { id: id2, tilemap: state.room2 }
    ];
    const doors = [
      { from: 'world', to: id1, x: state.entry?.x || 0, y: state.entry?.y || 0 },
      { from: id1, to: 'world', x: state.exit?.x || 0, y: state.exit?.y || 0 },
      { from: id1, to: id2, x: state.room1door?.x || 0, y: state.room1door?.y || 0 },
      { from: id2, to: id1, x: state.room2door?.x || 0, y: state.room2door?.y || 0 }
    ];
    return { buildings, doors };
  }
};
Dustland.BuildingWizard = BuildingWizard;
Dustland.wizards.building = BuildingWizard;
