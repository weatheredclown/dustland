(() => {
    var _a;
    const toChestSlug = (value) => value.trim().toLowerCase().replace(/\s+/g, '_');
    const dustlandChestWizard = ((_a = globalThis).Dustland ?? (_a.Dustland = {}));
    const wizardStepsChest = (dustlandChestWizard.WizardSteps ?? (dustlandChestWizard.WizardSteps = {}));
    const { text, mapPlacement, confirm } = wizardStepsChest;
    if (!text || !mapPlacement || !confirm) {
        console.warn('Chest wizard skipped initialization because required steps are missing.');
        return;
    }
    const chestWizard = {
        title: 'Chest Wizard',
        steps: [
            text('Chest Name', 'name'),
            text('Key Name', 'keyName'),
            text('Loot Name', 'lootName'),
            mapPlacement('chestPos'),
            mapPlacement('keyPos'),
            confirm('Done')
        ],
        commit(state) {
            const baseName = state.name ?? '';
            const baseId = toChestSlug(baseName);
            const chestId = baseId;
            const keyId = `${baseId}_key`;
            const lootId = `${baseId}_loot`;
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
                            { label: '(Use Key)', to: 'open', once: true, reqItem: keyId, effects: [{ effect: 'unlockNPC', npcId: chestId }] },
                            { label: '(Leave)', to: 'bye' }
                        ]
                    },
                    open: {
                        text: 'The chest creaks open, revealing ' + state.lootName + '.',
                        choices: [
                            { label: '(Take ' + state.lootName + ')', to: 'empty', reward: lootId, effects: [{ effect: 'addFlag', flag: `${chestId}_looted` }] }
                        ]
                    },
                    empty: {
                        text: 'The chest is empty.',
                        choices: [
                            { label: '(Lock Chest)', to: 'locked_empty', reqItem: keyId, effects: [{ effect: 'lockNPC', npcId: chestId }] },
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
    dustlandChestWizard.ChestWizard = chestWizard;
    const dustlandWizards = (dustlandChestWizard.wizards ?? (dustlandChestWizard.wizards = {}));
    dustlandWizards.chest = chestWizard;
})();
