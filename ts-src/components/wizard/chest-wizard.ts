// @ts-nocheck
(function(){
  const ChestWizard = {
    title: 'Chest Wizard',
    steps: [
      Dustland.WizardSteps.text('Chest Name', 'name'),
      Dustland.WizardSteps.text('Key Name', 'keyName'),
      Dustland.WizardSteps.text('Loot Name', 'lootName'),
      Dustland.WizardSteps.mapPlacement('chestPos'),
      Dustland.WizardSteps.mapPlacement('keyPos'),
      Dustland.WizardSteps.confirm('Done')
    ],
    commit(state) {
      const baseId = state.name.toLowerCase().replace(/\s+/g, '_');
      const chestId = baseId;
      const keyId = baseId + '_key';
      const lootId = baseId + '_loot';
      const key = {
        map: 'world',
        x: state.keyPos?.x,
        y: state.keyPos?.y,
        id: keyId,
        name: state.keyName,
        type: 'quest',
        tags: ['key']
      };
      const loot = {
        id: lootId,
        name: state.lootName,
        type: 'quest'
      };
      const chest = {
        id: chestId,
        map: 'world',
        x: state.chestPos?.x,
        y: state.chestPos?.y,
        color: '#ddf',
        name: state.name,
        symbol: '?',
        locked: true,
        tree: {
          locked: {
            text: 'A locked chest sits here.',
            choices: [
              { label: '(Use Key)', to: 'open', once: true, reqItem: keyId, effects: [ { effect: 'unlockNPC', npcId: chestId } ] },
              { label: '(Leave)', to: 'bye' }
            ]
          },
          open: {
            text: 'The chest creaks open, revealing ' + state.lootName + '.',
            choices: [
              { label: '(Take ' + state.lootName + ')', to: 'empty', reward: lootId, effects: [ { effect: 'addFlag', flag: chestId + '_looted' } ] }
            ]
          },
          empty: {
            text: 'The chest is empty.',
            choices: [
              { label: '(Lock Chest)', to: 'locked_empty', reqItem: keyId, effects: [ { effect: 'lockNPC', npcId: chestId } ] },
              { label: '(Leave)', to: 'bye' }
            ]
          },
          locked_empty: {
            text: 'The chest is empty and locked.',
            choices: [
              { label: '(Leave)', to: 'bye' }
            ]
          }
        }
      };
      return { items: [key, loot], npcs: [chest] };
    }
  };

  globalThis.Dustland = globalThis.Dustland || {};
  Dustland.ChestWizard = ChestWizard;
  Dustland.wizards = Dustland.wizards || {};
  Dustland.wizards.chest = ChestWizard;
})();
