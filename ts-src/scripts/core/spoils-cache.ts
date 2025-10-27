type SpoilsInventoryItem = {
  type?: string;
  rank?: string;
  name?: string;
  [key: string]: unknown;
};

type SpoilsPlayer = {
  inv?: SpoilsInventoryItem[];
};

type SpoilsEventBus = {
  emit?: (event: string, payload?: unknown) => void;
};

type SpoilsItemGenerator = {
  generate?: (rank: string, rng?: () => number) => SpoilsInventoryItem | null;
};

type SpoilsGlobals = {
  player?: SpoilsPlayer | null;
  removeFromInv?: (index: number) => void;
  notifyInventoryChanged?: () => void;
  addToInv?: (item: SpoilsInventoryItem) => boolean;
  dropItemNearParty?: (item: SpoilsInventoryItem) => void;
  ItemGen?: SpoilsItemGenerator;
  log?: (message: string) => void;
  EventBus?: SpoilsEventBus;
};

// ===== Spoils Cache =====
const spoilsGlobals = globalThis as typeof globalThis & SpoilsGlobals;

const spoilsRanks: Record<string, { name: string; desc: string; icon: string }> = {
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
};

const SpoilsCache = {
  ranks: spoilsRanks,
  baseRate: 0.08,
  tierWeights: {
    1: [['rusted', 0.8], ['sealed', 0.2]],
    4: [['rusted', 0.3], ['sealed', 0.6], ['armored', 0.1]],
    7: [['vaulted', 0.03], ['armored', 0.87], ['sealed', 0.1]],
    9: [['vaulted', 0.2], ['armored', 0.8]]
  },
  create(rank: string){
    const info = this.ranks[rank];
    if(!info) throw new Error('Unknown cache rank');
    return {
      id: `cache-${rank}`,
      name: info.name,
      type: 'spoils-cache',
      rank
    };
  },
  pickRank(challenge: number, rng: () => number = Math.random){
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
  rollDrop(challenge: number, rng: () => number = Math.random){
    const c = Math.max(1, challenge ?? 1);
    const chance = Math.min(1, this.baseRate * c);
    if(rng() >= chance) return null;
    const rank = this.pickRank(c, rng);
    return this.create(rank);
  },
  renderIcon(rank: string, onOpen?: () => void){
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
  open(rank: string, rng: () => number = Math.random){
    const playerInv = spoilsGlobals.player?.inv;
    if(!playerInv) return null;
    const idx = playerInv.findIndex(c => c.type === 'spoils-cache' && c.rank === rank);
    if(idx === -1) return null;
    if (typeof spoilsGlobals.removeFromInv === 'function') {
      spoilsGlobals.removeFromInv(idx);
    } else {
      playerInv.splice(idx,1);
      spoilsGlobals.notifyInventoryChanged?.();
    }
    const item = spoilsGlobals.ItemGen?.generate?.(rank, rng) ?? null;
    if(item){
      if(typeof spoilsGlobals.addToInv === 'function'){
        if(!spoilsGlobals.addToInv(item)){
          if(typeof spoilsGlobals.dropItemNearParty === 'function') spoilsGlobals.dropItemNearParty(item);
        }
      } else {
        playerInv.push(item);
        spoilsGlobals.notifyInventoryChanged?.();
      }
      spoilsGlobals.log?.(`${item.name ?? 'Item'} found in ${this.ranks[rank]?.name ?? rank}.`);
      spoilsGlobals.EventBus?.emit?.('spoils:opened', { rank, item });
    } else {
      spoilsGlobals.log?.(`${this.ranks[rank]?.name ?? rank} opened.`);
      spoilsGlobals.EventBus?.emit?.('spoils:opened', { rank });
    }
    return item;
  },
  openAll(rank: string, rng: () => number = Math.random){
    const playerInv = spoilsGlobals.player?.inv;
    if(!playerInv) return 0;
    let opened = 0;
    while(this.open(rank, rng)){
      opened++;
    }
    if(opened){
      const name = this.ranks[rank]?.name ?? rank;
      spoilsGlobals.log?.(`Opened ${opened} ${name}${opened>1?'s':''}.`);
    }
    return opened;
  }
};
Object.assign(globalThis, { SpoilsCache });
