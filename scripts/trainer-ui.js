(function () {
    const trainerGlobals = globalThis;
    function loadTrainerData() {
        if (!trainerGlobals.TRAINER_UPGRADES) {
            trainerGlobals.TRAINER_UPGRADES = {
                power: [
                    { id: 'str', label: 'STR +1', cost: 1, type: 'stat', stat: 'STR', delta: 1 },
                    { id: 'agi', label: 'AGI +1', cost: 1, type: 'stat', stat: 'AGI', delta: 1 }
                ],
                endurance: [
                    { id: 'hp', label: 'Max HP +5', cost: 1, type: 'stat', stat: 'HP', delta: 5 },
                    { id: 'def', label: 'DEF +1', cost: 1, type: 'stat', stat: 'DEF', delta: 1 }
                ],
                tricks: [
                    { id: 'per', label: 'PER +1', cost: 1, type: 'stat', stat: 'PER', delta: 1 },
                    { id: 'lck', label: 'LCK +1', cost: 1, type: 'stat', stat: 'LCK', delta: 1 }
                ]
            };
        }
        return trainerGlobals.TRAINER_UPGRADES;
    }
    function showTrainer(id) {
        const data = loadTrainerData();
        const upgrades = data[id] ?? [];
        const npc = trainerGlobals.currentNPC ?? null;
        const npcTree = npc?.tree;
        const dialogStateTree = typeof trainerGlobals.dialogState === 'object' ? trainerGlobals.dialogState?.tree ?? null : null;
        const dsTree = dialogStateTree;
        const trainNode = dsTree?.train || npcTree?.train;
        if (!trainNode)
            return false;
        if (dsTree && !dsTree.train)
            dsTree.train = trainNode;
        if (npcTree && !npcTree.train)
            npcTree.train = trainNode;
        const lead = typeof trainerGlobals.leader === 'function' ? trainerGlobals.leader() ?? null : null;
        const trainingName = (lead?.name ?? '').trim();
        const trainingLine = trainingName ? `\ntraining: ${trainingName}` : '';
        trainNode.text = `Skill Points: ${lead?.skillPoints ?? 0}${trainingLine}`;
        const choices = upgrades.map(up => {
            let base = 0;
            if (lead) {
                base = up.stat === 'HP' ? lead.maxHp : (lead?.stats?.[up.stat] ?? 0);
            }
            const after = base + (up.delta ?? 0);
            return {
                label: `${up.label} (Cost:${up.cost}) ${base}\u2192${after}`,
                to: 'train',
                effects: [() => applyUpgrade(id, up.id)]
            };
        });
        choices.push({ label: '(Back)', to: 'start' });
        trainNode.choices = choices;
        trainNode.next = choices;
        return true;
    }
    function applyUpgrade(trainerId, upgradeId) {
        const data = loadTrainerData();
        const up = (data[trainerId] ?? []).find(u => u.id === upgradeId);
        if (!up)
            return false;
        if (up.type === 'stat') {
            const stat = up.stat;
            if (!stat)
                return false;
            const ok = typeof trainerGlobals.trainStat === 'function' ? trainerGlobals.trainStat(stat) : false;
            if (ok)
                showTrainer(trainerId);
            return ok;
        }
        return false;
    }
    trainerGlobals.TrainerUI = { showTrainer, applyUpgrade };
})();
