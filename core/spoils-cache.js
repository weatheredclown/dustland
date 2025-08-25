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
  baseRate: 0.1,
  create(rank){
    const info = this.ranks[rank];
    if(!info) throw new Error('Unknown cache rank');
    return {
      id: `cache-${rank}`,
      name: info.name,
      type: 'spoils-cache',
      rank
    };
  },
  pickRank(challenge, rng=Math.random){
    const c = Math.max(1, Math.min(10, challenge|0));
    const r = rng();
    if(c >= 9){
      return r < 0.3 ? 'vaulted' : 'armored';
    }
    if(c >= 7){
      if(r < 0.1) return 'vaulted';
      if(r < 0.7) return 'armored';
      return 'sealed';
    }
    if(c >= 4){
      if(r < 0.1) return 'armored';
      if(r < 0.7) return 'sealed';
      return 'rusted';
    }
    return r < 0.2 ? 'sealed' : 'rusted';
  },
  rollDrop(challenge, rng=Math.random){
    const c = Math.max(1, challenge||1);
    const chance = Math.min(1, this.baseRate * c);
    if(rng() >= chance) return null;
    const rank = this.pickRank(c, rng);
    return this.create(rank);
  }
};
Object.assign(globalThis, { SpoilsCache });
