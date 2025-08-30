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
    ]
  };

  globalThis.Dustland = globalThis.Dustland || {};
  Dustland.NpcWizard = NpcWizard;
})();
