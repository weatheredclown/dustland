(function(){
  function loadTrainerData(){
    if(!globalThis.TRAINER_UPGRADES){
      globalThis.TRAINER_UPGRADES = {
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
    return globalThis.TRAINER_UPGRADES;
  }

  function showTrainer(id, memberIndex = 0){
    const data = loadTrainerData();
    const upgrades = data[id] || [];
    const npc = globalThis.currentNPC;
    const tree = (typeof dialogState === 'object' && dialogState?.tree) || npc?.tree;
    const trainNode = tree?.train;
    if(!trainNode) return false;
    const member = globalThis.party?.[memberIndex];
    const lead = typeof leader === 'function' ? leader() : null;
    trainNode.text = `Skill Points: ${lead?.skillPoints || 0}`;
    const choices = upgrades.map(up => {
      let base = 0;
      if(member){
        base = up.stat === 'HP' ? member.maxHp : (member.stats[up.stat] || 0);
      }
      const after = base + (up.delta || 0);
      return {
        label: `${up.label} (Cost:${up.cost}) ${base}\u2192${after}`,
        to: 'train',
        effects: [() => applyUpgrade(id, up.id, memberIndex)]
      };
    });
    choices.push({ label: '(Back)', to: 'start' });
    trainNode.choices = choices;
    if(npc?.tree && npc.tree !== tree) npc.tree.train = trainNode;
    return true;
  }

  function applyUpgrade(trainerId, upgradeId, memberIndex){
    const data = loadTrainerData();
    const up = (data[trainerId] || []).find(u => u.id === upgradeId);
    if(!up) return false;
    if(up.type === 'stat'){
      const ok = trainStat(up.stat, memberIndex);
      if(ok) showTrainer(trainerId, memberIndex);
      return ok;
    }
    return false;
  }

  globalThis.TrainerUI = { showTrainer, applyUpgrade };
})();

