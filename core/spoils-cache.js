// ===== Spoils Cache =====
const SpoilsCache = {
  ranks: {
    rusted: {
      name: 'Rusted Cache',
      desc: 'Hinges squeal; expect scraps and makeshift tools.'
    },
    sealed: {
      name: 'Sealed Cache',
      desc: 'Intact plating and corporate wax. Solid baseline loot.'
    },
    armored: {
      name: 'Armored Cache',
      desc: 'Reinforced with ex-military alloy. High-grade hardware.'
    },
    vaulted: {
      name: 'Vaulted Cache',
      desc: 'Quantum locks and glowing seams. Legendary rarities.'
    }
  },
  create(rank){
    const info = this.ranks[rank];
    if(!info) throw new Error('Unknown cache rank');
    return {
      id: `cache-${rank}`,
      name: info.name,
      type: 'spoils-cache',
      rank
    };
  }
};
Object.assign(globalThis, { SpoilsCache });
