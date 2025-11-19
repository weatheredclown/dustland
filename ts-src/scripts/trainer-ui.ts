type TrainerDialogChoice = {
  label: string;
  to?: string;
  effects?: Array<() => unknown>;
};

type TrainerDialogNode = {
  text?: string;
  choices?: TrainerDialogChoice[];
  next?: TrainerDialogChoice[] | null;
  train?: TrainerDialogNode;
  [key: string]: unknown;
};

type TrainerNpc = {
  tree?: TrainerDialogNode | null;
  [key: string]: unknown;
} | null;

type TrainerState = {
  tree?: TrainerDialogNode | null;
};

type TrainerLeader = {
  skillPoints?: number;
  stats?: Record<string, number>;
  maxHp?: number;
  hp?: number;
};

type TrainerParty = TrainerLeader[] & { selectedMember?: number };

type TrainerGlobals = {
  TRAINER_UPGRADES?: TrainerUpgradeMap;
  currentNPC?: TrainerNpc;
  dialogState?: TrainerState | null;
  leader?: () => TrainerLeader | null | undefined;
  trainStat?: (stat: string) => boolean;
  party?: TrainerParty;
  renderParty?: () => void;
  updateHUD?: () => void;
  TrainerUI?: {
    showTrainer: (id: string) => boolean;
    applyUpgrade: (trainerId: string, upgradeId: string) => boolean;
  };
};
(function(){
  const trainerGlobals = globalThis as typeof globalThis & TrainerGlobals;

  function leader(): TrainerLeader | null {
    if(typeof trainerGlobals.leader === 'function'){
      const fromGlobals = trainerGlobals.leader();
      if(fromGlobals) return fromGlobals;
    }
    const p = trainerGlobals.party;
    if(!p || !Array.isArray(p) || p.length === 0){
      return null;
    }
    const idx = typeof p.selectedMember === 'number' ? p.selectedMember : 0;
    return p[idx] ?? p[0] ?? null;
  }

  function trainStat(stat: string): boolean {
    if(typeof trainerGlobals.trainStat === 'function'){
      return trainerGlobals.trainStat(stat);
    }
    const m = leader();
    if(!m) return false;

    if((m.skillPoints ?? 0) > 0){
      m.skillPoints = (m.skillPoints ?? 0) - 1;
      if(stat === 'HP'){
        m.maxHp = (m.maxHp ?? 0) + 5;
        m.hp = (m.hp ?? 0) + 5;
      }else{
        const stats = m.stats ?? (m.stats = {});
        stats[stat] = (stats[stat] ?? 0) + 1;
      }
      if(typeof trainerGlobals.renderParty === 'function') trainerGlobals.renderParty();
      if(typeof trainerGlobals.updateHUD === 'function') trainerGlobals.updateHUD();
      return true;
    }
    return false;
  }

  function loadTrainerData(): TrainerUpgradeMap {
    if(!trainerGlobals.TRAINER_UPGRADES){
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

  function showTrainer(id: string): boolean {
    const data = loadTrainerData();
    const upgrades = data[id] ?? [];
    const npc = trainerGlobals.currentNPC ?? null;
    const npcTree = npc?.tree;
    const dialogStateTree = typeof trainerGlobals.dialogState === 'object' ? trainerGlobals.dialogState?.tree ?? null : null;
    const dsTree = dialogStateTree;
    const trainNode = dsTree?.train || npcTree?.train;
    if(!trainNode) return false;
    if(dsTree && !dsTree.train) dsTree.train = trainNode;
    if(npcTree && !npcTree.train) npcTree.train = trainNode;
    const lead = leader() ?? null;
    trainNode.text = `Skill Points: ${lead?.skillPoints ?? 0}`;
    const choices: TrainerDialogChoice[] = upgrades.map(up => {
      let base = 0;
      if(lead){
        base = up.stat === 'HP' ? lead.maxHp : (lead?.stats?.[up.stat] ?? 0);
      }
      const after = base + (up.delta ?? 0);
      return {
        label: `${up.label} (Cost:${up.cost}) ${base}\u2192${after}`,
        to: 'train',
        effects: [() => applyUpgrade(id, up.id)]
      } as TrainerDialogChoice;
    });
    choices.push({ label: '(Back)', to: 'start' });
    trainNode.choices = choices;
    trainNode.next = choices;
    return true;
  }

  function applyUpgrade(trainerId: string, upgradeId: string): boolean {
    const data = loadTrainerData();
    const up = (data[trainerId] ?? []).find(u => u.id === upgradeId);
    if(!up) return false;
    if(up.type === 'stat'){
      const stat = up.stat;
      if(!stat) return false;
      const ok = trainStat(stat);
      if(ok) showTrainer(trainerId);
      return ok;
    }
    return false;
  }

  trainerGlobals.TrainerUI = { showTrainer, applyUpgrade };
})();

