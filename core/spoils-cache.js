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
      return r < 0.2 ? 'vaulted' : 'armored';
    }
    if(c >= 7){
      if(r < 0.03) return 'vaulted';
      if(r < 0.9) return 'armored';
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
  },
  renderIcon(rank, onOpen){
    const info = this.ranks[rank];
    if(!info || typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.className = `cache-icon ${rank}`;
    el.textContent = info.icon || '';
    el.addEventListener('click', () => {
      el.classList.add('open');
      setTimeout(() => {
        el.remove();
        onOpen?.();
        globalThis.EventBus?.emit?.('spoils:opened', { rank });
      }, 200);
    }, { once: true });
    return el;
  },
  openAll(rank){
    if(!player?.inv) return 0;
    let opened = 0;
    for(let i = player.inv.length - 1; i >= 0; i--){
      const it = player.inv[i];
      if(it.type === 'spoils-cache' && it.rank === rank){
        player.inv.splice(i,1);
        opened++;
        globalThis.EventBus?.emit?.('spoils:opened', { rank });
      }
    }
    if(opened){
      const name = this.ranks[rank]?.name || rank;
      log?.(`Opened ${opened} ${name}${opened>1?'s':''}.`);
      notifyInventoryChanged?.();
    }
    return opened;
  }
};
Object.assign(globalThis, { SpoilsCache });
