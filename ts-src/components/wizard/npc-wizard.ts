// @ts-nocheck
(function(){
  const NpcWizard = {
    title: 'NPC & Quest Wizard',
    steps: [
      Dustland.WizardSteps.text('Name', 'name'),
      Dustland.WizardSteps.assetPicker('Portrait', ['portrait_1000.png', 'portrait_1001.png'], 'portrait'),
      // Notes for artists to craft a portrait if one is missing
      Dustland.WizardSteps.text('Portrait Prompt', 'prompt'),
      Dustland.WizardSteps.text('Dialogue', 'dialogue'),
      Dustland.WizardSteps.itemPicker('Fetch Item', ['tuned_crystal', 'signal_fragment_1'], 'questItem', 'scrapReward'),
      Dustland.WizardSteps.mapPlacement('pos'),
      Dustland.WizardSteps.confirm('Done')
    ],
    commit(state) {
      const id = state.name.toLowerCase().replace(/\s+/g, '_');
      const npc = {
        id,
        name: state.name,
        portrait: state.portrait,
        prompt: state.prompt,
        tree: {
          start: {
            text: state.dialogue,
            choices: [ { label: '(Leave)', to: 'bye' } ]
          }
        },
        map: 'world',
        x: state.pos?.x,
        y: state.pos?.y
      };
      const quest = {
        id: id + '_quest',
        giver: id,
        item: state.questItem,
        reward: 'SCRAP ' + state.scrapReward
      };
      return { npcs: [npc], quests: [quest] };
    }
  };

  globalThis.Dustland = globalThis.Dustland || {};
  Dustland.NpcWizard = NpcWizard;
  Dustland.wizards = Dustland.wizards || {};
  Dustland.wizards.npc = NpcWizard;
})();
