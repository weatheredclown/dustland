(() => {
    var _a;
    const toSlug = (value) => value.trim().toLowerCase().replace(/\s+/g, '_');
    const dustlandNpcWizard = ((_a = globalThis).Dustland ?? (_a.Dustland = {}));
    const wizardStepsNpc = (dustlandNpcWizard.WizardSteps ?? (dustlandNpcWizard.WizardSteps = {}));
    const { text, assetPicker, itemPicker, mapPlacement, confirm } = wizardStepsNpc;
    if (!text || !assetPicker || !itemPicker || !mapPlacement || !confirm) {
        console.warn('NPC wizard skipped initialization because required steps are missing.');
        return;
    }
    const npcWizard = {
        title: 'NPC & Quest Wizard',
        steps: [
            text('Name', 'name'),
            assetPicker('Portrait', ['portrait_1000.png', 'portrait_1001.png'], 'portrait'),
            text('Portrait Prompt', 'prompt'),
            text('Dialogue', 'dialogue'),
            itemPicker('Fetch Item', ['tuned_crystal', 'signal_fragment_1'], 'questItem', 'scrapReward'),
            mapPlacement('pos'),
            confirm('Done')
        ],
        commit(state) {
            const nameValue = state.name ?? '';
            const id = toSlug(nameValue);
            const npc = {
                id,
                name: state.name,
                portrait: state.portrait,
                prompt: state.prompt,
                tree: {
                    start: {
                        text: state.dialogue,
                        choices: [{ label: '(Leave)', to: 'bye' }]
                    }
                },
                map: 'world',
                x: state.pos?.x,
                y: state.pos?.y
            };
            const quest = {
                id: `${id}_quest`,
                giver: id,
                item: state.questItem,
                reward: `SCRAP ${String(state.scrapReward)}`
            };
            return { npcs: [npc], quests: [quest] };
        }
    };
    dustlandNpcWizard.NpcWizard = npcWizard;
    const dustlandWizards = (dustlandNpcWizard.wizards ?? (dustlandNpcWizard.wizards = {}));
    dustlandWizards.npc = npcWizard;
})();
