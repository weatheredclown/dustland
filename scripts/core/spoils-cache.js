// ===== Spoils Cache =====
const SpoilsCache = {
  ranks: {
    rusted: {
      name: 'Rusted Cache',
      desc: 'Hinges squeal; expect scraps and makeshift tools.',
      icon: '🥫'
    },
    sealed: {
      name: 'Sealed Cache',
      desc: 'Intact plating and corporate wax. Solid baseline loot.',
      icon: '📦'
    },
    armored: {
      name: 'Armored Cache',
      desc: 'Reinforced with ex-military alloy. High-grade hardware.',
      icon: '🛡️'
    },
    vaulted: {
      name: 'Vaulted Cache',
      desc: 'Quantum locks and glowing seams. Legendary rarities.',
      icon: '💠'
    }
  },
  baseRate: 0.08,
  tierWeights: {
    1: [['rusted', 0.8], ['sealed', 0.2]],
    4: [['rusted', 0.3], ['sealed', 0.6], ['armored', 0.1]],
    7: [['vaulted', 0.03], ['armored', 0.87], ['sealed', 0.1]],
    9: [['vaulted', 0.2], ['armored', 0.8]]
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
  },
  pickRank(challenge, rng=Math.random){
    const c = Math.max(1, Math.min(10, challenge|0));
    const tiers = Object.keys(this.tierWeights).map(Number).sort((a,b)=>a-b);
    let weights = this.tierWeights[tiers[0]];
    for(const t of tiers){
      if(c >= t) weights = this.tierWeights[t];
    }
    const r = rng();
    let sum = 0;
    for(const [rank, weight] of weights){
      sum += weight;
      if(r < sum) return rank;
    }
    return weights[0][0];
  },
  rollDrop(challenge, rng=Math.random){
    const c = Math.max(1, challenge ?? 1);
    const chance = Math.min(1, this.baseRate * c);
    if(rng() >= chance) return null;
    const rank = this.pickRank(c, rng);
    return this.create(rank);
  },
  renderIcon(rank, onOpen){
    const info = this.ranks[rank];
    if(!info || typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.className = `cache-icon ${rank}`;
    el.textContent = info.icon ?? '';
    el.addEventListener('click', () => {
      el.classList.add('open');
      setTimeout(() => {
        el.remove();
        onOpen?.();
      }, 200);
    }, { once: true });
    return el;
  },
  open(rank, rng=Math.random){
    if(!player?.inv) return null;
    const idx = player.inv.findIndex(c => c.type === 'spoils-cache' && c.rank === rank);
    if(idx === -1) return null;
    player.inv.splice(idx,1);
    notifyInventoryChanged?.();
    const item = globalThis.ItemGen?.generate?.(rank, rng);
    if(item){
      if(typeof addToInv === 'function'){
        if(!addToInv(item)){
          if(typeof dropItemNearParty === 'function') dropItemNearParty(item);
        }
      } else {
        player.inv.push(item);
        notifyInventoryChanged?.();
      }
        globalThis.log?.(`${item.name} found in ${this.ranks[rank]?.name ?? rank}.`);
      globalThis.EventBus?.emit?.('spoils:opened', { rank, item });
    } else {
        globalThis.log?.(`${this.ranks[rank]?.name ?? rank} opened.`);
      globalThis.EventBus?.emit?.('spoils:opened', { rank });
    }
    return item;
  },
  openAll(rank, rng=Math.random){
    if(!player?.inv) return 0;
    let opened = 0;
    while(this.open(rank, rng)){
      opened++;
    }
    if(opened){
        const name = this.ranks[rank]?.name ?? rank;
      globalThis.log?.(`Opened ${opened} ${name}${opened>1?'s':''}.`);
    }
    return opened;
  }
};
Object.assign(globalThis, { SpoilsCache });
