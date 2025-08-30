(function(){
  const NpcWizard = {
    title: 'NPC & Quest Wizard',
    steps: [
      Dustland.WizardSteps.text('Name', 'name'),
      Dustland.WizardSteps.assetPicker('Portrait', ['portrait_1000.png', 'portrait_1001.png'], 'portrait'),
      Dustland.WizardSteps.text('Dialogue', 'dialogue'),
      Dustland.WizardSteps.itemPicker('Fetch Item', ['tuned_crystal', 'signal_fragment_1'], 'questItem'),
      Dustland.WizardSteps.mapPlacement('pos'),
      Dustland.WizardSteps.confirm('Done')
    ],
    commit(state) {
      const id = state.name.toLowerCase().replace(/\s+/g, '_');
      const npc = {
        id,
        name: state.name,
        portrait: state.portrait,
        dialogue: state.dialogue,
        x: state.pos?.x,
        y: state.pos?.y
      };
      const quest = {
        id: id + '_quest',
        giver: id,
        item: state.questItem
      };
      return { npcs: [npc], quests: [quest] };
    }
  };

  globalThis.Dustland = globalThis.Dustland || {};
  Dustland.NpcWizard = NpcWizard;
})();
