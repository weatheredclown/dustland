type TraderInventorySeed = string | TraderInventoryConfig;

interface TraderInventoryConfig {
  id: string;
  count?: number;
  maxStack?: number;
  value?: number;
  tier?: number;
  rarity?: string | number;
  rank?: string;
  scarcity?: string | number;
  [key: string]: unknown;
}

interface TraderInventoryItem extends TraderInventoryConfig {
  count: number;
}

type TraderWave = TraderInventorySeed[];

interface TraderOptions {
  waves?: TraderWave[];
  inventory?: TraderInventorySeed[];
  grudge?: number;
  markup?: number;
  refresh?: number;
}

type TraderItemUse = (Partial<GameItemUse> & { type?: string | undefined }) | null | undefined;

type TraderItemLike = Partial<GameItem> & {
  mods?: Record<string, number | undefined> | undefined;
  use?: TraderItemUse;
  rank?: string | undefined;
  tier?: number | undefined;
  rarity?: string | number | undefined;
  scarcity?: string | number | undefined;
};

interface TraderPriceOptions {
  entry?: TraderInventoryConfig | TraderInventoryItem | null;
  markup?: number;
  grudge?: number;
  tierMultiplier?: number;
  scarcityMultiplier?: number;
}

const traderBus = (globalThis.Dustland?.eventBus ?? globalThis.EventBus) ?? undefined;
const SHOP_STACK_LIMIT = 256;
const PRICE_EXPONENT = 0.6;
const PRICE_SCALE = 15;
const PRICE_BASE = 10;
const MIN_PRICE = 5;
const VALUE_SCALE = 0.55;
const MIN_BASE_VALUE = 6;
const STAT_WEIGHTS = Object.freeze({
  ATK: 26,
  DEF: 18,
  STR: 20,
  AGI: 20,
  INT: 20,
  PER: 20,
  LCK: 14,
  CHA: 14,
  HP: 8,
  ADR: 1,
  _default: 12
} as const);
const MOD_WEIGHTS = Object.freeze({
  adrenaline_gen_mod: 80,
  adrenaline_dmg_mod: 80,
  adrenaline_cost_mod: 80,
  adrenaline_decay_mod: 60,
  dodge_mod: 60,
  block_mod: 60,
  crit_mod: 80,
  damage_mod: 60,
  damage_taken_mod: 60,
  poison_resist: 40,
  fire_resist: 40,
  bleed_resist: 40,
  radiation_resist: 40,
  cold_resist: 40,
  shock_resist: 40,
  _default: 40
} as const);
const USE_WEIGHTS = Object.freeze({
  heal: 3.5,
  boost: 4,
  grenade: 18,
  cleanse: 6,
  antidote: 5,
  revive: 25,
  restore: 5,
  detox: 5,
  shield: 6,
  default: 2
} as const);
const RARITY_MULTIPLIERS = Object.freeze({
  common: 1,
  uncommon: 1.1,
  rare: 1.25,
  epic: 1.45,
  legendary: 1.7
} as const);
const RANK_MULTIPLIERS = Object.freeze({
  rusted: 0.9,
  sealed: 1,
  armored: 1.15,
  vaulted: 1.35
} as const);
const RANK_BASE_VALUES = Object.freeze({
  rusted: 40,
  sealed: 70,
  armored: 110,
  vaulted: 170
} as const);
const SCARCITY_MULTIPLIERS = Object.freeze({
  abundant: 0.9,
  ample: 0.95,
  common: 1,
  standard: 1,
  limited: 1.08,
  scarce: 1.18,
  rare: 1.3,
  unique: 1.45
} as const);

class Trader {
  id: string;
  waves: TraderWave[] | null;
  waveIndex: number;
  inventory: TraderInventoryItem[];
  grudge: number;
  markup: number;
  refreshHours: number;

  constructor(id: string, opts: TraderOptions = {}){
    this.id = id;
    this.waves = Array.isArray(opts.waves) ? opts.waves.map(w => [...w]) : null;
    this.waveIndex = 0;
    this.inventory = [];
    const seed = Array.isArray(opts.inventory) ? opts.inventory : (this.waves ? this.waves[0] : []);
    if (Array.isArray(seed)) {
      seed.forEach(entry => this.addItem(entry));
    }
    this.grudge = typeof opts.grudge === 'number' ? opts.grudge : 0;
    this.markup = typeof opts.markup === 'number' ? opts.markup : 1;
    this.refreshHours = typeof opts.refresh === 'number' ? opts.refresh : 0;
  }

  addItem(item: TraderInventorySeed | TraderInventoryConfig | TraderInventoryItem | null | undefined): void {
    if (!item) return;
    const baseConfig = typeof item === 'string' ? { id: item } : { ...item };
    const id = baseConfig.id;
    if (typeof id !== 'string' || !id) return;
    const entry: TraderInventoryConfig & { id: string } = { ...baseConfig, id };
    const maxFromEntry = typeof entry.maxStack === 'number' && Number.isFinite(entry.maxStack)
      ? entry.maxStack
      : SHOP_STACK_LIMIT;
    let remaining = Math.max(1, typeof entry.count === 'number' && Number.isFinite(entry.count) ? entry.count : 1);
    for (const invItem of this.inventory){
      if (!invItem || invItem.id !== id) continue;
      const limitBase = typeof invItem.maxStack === 'number' && Number.isFinite(invItem.maxStack)
        ? invItem.maxStack
        : maxFromEntry;
      const limit = Math.min(SHOP_STACK_LIMIT, limitBase);
      const current = Math.max(1, typeof invItem.count === 'number' && Number.isFinite(invItem.count) ? invItem.count : 1);
      const space = limit - current;
      if (space <= 0) continue;
      const add = Math.min(space, remaining);
      invItem.count = current + add;
      remaining -= add;
      if (!remaining) break;
    }
    while (remaining > 0){
      const maxStack = typeof entry.maxStack === 'number' && Number.isFinite(entry.maxStack)
        ? entry.maxStack
        : SHOP_STACK_LIMIT;
      const add = Math.min(SHOP_STACK_LIMIT, maxStack, remaining);
      const next: TraderInventoryItem = { ...entry, count: add };
      this.inventory.push(next);
      remaining -= add;
    }
  }

  clearGrudge(): void {
    this.grudge = 0;
  }

  recordCancel(): void {
    this.grudge++;
  }

  price(valueOrItem: number | TraderItemLike, entry?: TraderInventoryConfig | TraderInventoryItem | null): number {
    if (typeof valueOrItem === 'number' && entry === undefined) {
      return Trader.calculatePrice(valueOrItem, {
        markup: this.markup,
        grudge: this.grudge
      });
    }
    return Trader.calculatePrice(valueOrItem, {
      entry: entry ?? null,
      markup: this.markup,
      grudge: this.grudge
    });
  }

  recordPurchase(): void {
    this.grudge = 0;
  }

  refresh(): void {
    this.grudge = 0;
    if (this.waves && this.waveIndex < this.waves.length - 1) {
      this.waveIndex++;
      this.inventory = [];
      const nextWave = this.waves[this.waveIndex] || [];
      nextWave.forEach(entry => this.addItem(entry));
    }
    traderBus?.emit?.('trader:refresh', { trader: this });
  }

  static calculatePrice(itemOrValue: number | TraderItemLike | null | undefined, options: TraderPriceOptions = {}): number {
    if (typeof itemOrValue === 'number' || itemOrValue == null) {
      const baseValue = typeof itemOrValue === 'number' ? itemOrValue : 0;
      const basePrice = Trader.basePriceFromValue(baseValue);
      return Trader.finalizePrice(basePrice, options);
    }
    const entry = options.entry ?? null;
    const baseValue = Trader.resolveBaseValue(itemOrValue, entry);
    const basePrice = Trader.basePriceFromValue(baseValue);
    const tierMultiplier = options.tierMultiplier ?? Trader.resolveTierMultiplier(itemOrValue, entry);
    const scarcityMultiplier = options.scarcityMultiplier ?? Trader.resolveScarcityMultiplier(entry, itemOrValue);
    return Trader.finalizePrice(basePrice, {
      ...options,
      tierMultiplier,
      scarcityMultiplier
    });
  }

  static finalizePrice(basePrice: number, opts: TraderPriceOptions = {}): number {
    const markup = typeof opts.markup === 'number' ? opts.markup : 1;
    const tierMultiplier = typeof opts.tierMultiplier === 'number' ? opts.tierMultiplier : 1;
    const scarcityMultiplier = typeof opts.scarcityMultiplier === 'number' ? opts.scarcityMultiplier : 1;
    const grudgeMultiplier = Trader.resolveGrudgeMultiplier(opts.grudge);
    const price = basePrice * markup * tierMultiplier * scarcityMultiplier * grudgeMultiplier;
    return Math.max(MIN_PRICE, Math.round(price));
  }

  static resolveGrudgeMultiplier(grudge: number | null | undefined): number {
    const g = typeof grudge === 'number' && Number.isFinite(grudge) ? grudge : 0;
    if (g >= 3) return 1.1;
    if (g <= 0) return 0.96;
    if (g >= 2) return 1.03;
    return 1;
  }

  static basePriceFromValue(value: number | null | undefined): number {
    const safe = Math.max(0, typeof value === 'number' && Number.isFinite(value) ? value : 0);
    const scaled = Math.pow(safe || MIN_BASE_VALUE, PRICE_EXPONENT) * PRICE_SCALE + PRICE_BASE;
    return Math.max(MIN_PRICE, scaled);
  }

  static resolveBaseValue(item: TraderItemLike, entry: TraderInventoryConfig | TraderInventoryItem | null | undefined): number {
    const value = typeof item.value === 'number' ? item.value * VALUE_SCALE : 0;
    const fallbackEntryValue = entry && typeof entry.value === 'number' ? entry.value : 0;
    const fallback = Trader.estimateBaselineValue(item) || fallbackEntryValue;
    if (value > 0 && fallback > 0) return Math.max(value, fallback);
    if (value > 0) return Math.max(value, MIN_BASE_VALUE);
    if (fallback > 0) return Math.max(fallback, MIN_BASE_VALUE);
    return MIN_BASE_VALUE;
  }

  static estimateBaselineValue(item: TraderItemLike): number {
    if (!item || typeof item !== 'object') return 0;
    let total = 0;
    const mods = item.mods ?? {};
    Object.keys(mods).forEach(key => {
      const raw = mods[key];
      if (typeof raw !== 'number' || !Number.isFinite(raw)) return;
      if (key.endsWith('_mod')) {
        const delta = raw - 1;
        if (!delta) return;
        const weight = MOD_WEIGHTS[key as keyof typeof MOD_WEIGHTS] ?? MOD_WEIGHTS._default;
        total += Math.abs(delta) * weight;
        return;
      }
      if (key.endsWith('_immune')) {
        const weight = MOD_WEIGHTS[key as keyof typeof MOD_WEIGHTS] ?? MOD_WEIGHTS._default;
        total += Math.abs(raw) * weight;
        return;
      }
      const weight = STAT_WEIGHTS[key as keyof typeof STAT_WEIGHTS] ?? STAT_WEIGHTS._default;
      if (raw > 0) {
        total += raw * weight;
      } else if (raw < 0) {
        total += raw * weight * 0.25;
      }
    });
    const use = item.use;
    if (use && typeof use === 'object') {
      const type = typeof use.type === 'string' && use.type ? use.type : 'default';
      const weight = USE_WEIGHTS[type as keyof typeof USE_WEIGHTS] ?? USE_WEIGHTS.default;
      const amountRaw = typeof use.amount === 'number' && Number.isFinite(use.amount) ? use.amount : 1;
      const amt = Math.abs(amountRaw) || 1;
      const durationRaw = typeof use.duration === 'number' && Number.isFinite(use.duration) ? use.duration : 1;
      const duration = Math.max(1, Math.abs(durationRaw) || 1);
      total += amt * weight * duration;
    }
    if (typeof item.rank === 'string') {
      const rankKey = item.rank.toLowerCase() as keyof typeof RANK_BASE_VALUES;
      const bonus = RANK_BASE_VALUES[rankKey];
      if (typeof bonus === 'number') total += bonus;
    }
    if (!total && typeof item.tier === 'number') {
      total += Math.max(0, item.tier) * 12;
    }
    return total;
  }

  static resolveTierMultiplier(
    item: TraderItemLike,
    entry: TraderInventoryConfig | TraderInventoryItem | null | undefined
  ): number {
    const tierSource = entry?.tier ?? item?.tier;
    if (typeof tierSource === 'number' && Number.isFinite(tierSource)) {
      if (tierSource <= 1) return 1;
      return 1 + Math.min(0.8, Math.max(0, tierSource - 1) * 0.15);
    }
    const raritySource = entry?.rarity ?? item?.rarity ?? '';
    const rarity = raritySource != null ? raritySource.toString().toLowerCase() : '';
    if (rarity && RARITY_MULTIPLIERS[rarity as keyof typeof RARITY_MULTIPLIERS]) {
      return RARITY_MULTIPLIERS[rarity as keyof typeof RARITY_MULTIPLIERS];
    }
    const rankSource = entry?.rank ?? item?.rank ?? '';
    const rank = rankSource != null ? rankSource.toString().toLowerCase() : '';
    if (rank && RANK_MULTIPLIERS[rank as keyof typeof RANK_MULTIPLIERS]) {
      return RANK_MULTIPLIERS[rank as keyof typeof RANK_MULTIPLIERS];
    }
    return 1;
  }

  static resolveScarcityMultiplier(
    entry: TraderInventoryConfig | TraderInventoryItem | null | undefined,
    item: TraderItemLike
  ): number {
    const entryScarcity = entry && entry.scarcity !== undefined ? entry.scarcity : undefined;
    const source = entryScarcity !== undefined ? entryScarcity : item?.scarcity;
    if (source == null) {
      const countSource = entry && typeof entry.count === 'number' && Number.isFinite(entry.count) ? entry.count : 1;
      if (countSource >= 5) return 0.95;
      if (countSource >= 3) return 0.98;
      return 1;
    }
    if (typeof source === 'number' && Number.isFinite(source)) {
      if (source <= 0) return 0.9;
      return 1 + Math.min(0.6, source * 0.12);
    }
    const key = source.toString().toLowerCase() as keyof typeof SCARCITY_MULTIPLIERS;
    return SCARCITY_MULTIPLIERS[key] ?? 1;
  }
}

globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.Trader = Trader;
