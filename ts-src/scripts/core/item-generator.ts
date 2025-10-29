// ===== Item Generator =====
type RandomSource = () => number;

interface ItemStatRange {
  min: number;
  max: number;
}

const DEFAULT_STAT_RANGES = {
  rusted: { min: 1, max: 4 },
  sealed: { min: 4, max: 7 },
  armored: { min: 7, max: 10 },
  vaulted: { min: 10, max: 15 },
} as const;

type ItemRank = keyof typeof DEFAULT_STAT_RANGES | (string & {});

interface GeneratedTrinket extends PartyItem {
  rank: string;
  stats: Record<string, number>;
  mods: Record<string, number>;
  scrap: number;
  tags: string[];
  persona?: string;
}

interface ItemGenerator {
  adjectives: readonly string[];
  nouns: readonly string[];
  statRanges: Record<string, ItemStatRange>;
  scrapValues: Record<string, number>;
  statKeys: readonly string[];
  calcScrap: (item: GeneratedTrinket) => number;
  pick: <T>(list: readonly T[], rng: RandomSource) => T;
  randRange: (min: number, max: number, rng: RandomSource) => number;
  generate: (rank?: ItemRank, rng?: RandomSource) => GeneratedTrinket;
}

let nextItemId = 1;

const ItemGen: ItemGenerator = {
  adjectives: [
    'Grit-Stitched',
    'Rusty',
    'Quantum',
    'Crystal',
    'Welded',
    'Scrap-Bound',
    'Solar-Forged',
    'Echoing',
    'Harmonic',
    'Nova-Etched',
  ],
  nouns: [
    'Repeater',
    'Shield',
    'Gizmo',
    'Compass',
    'Blade',
    'Injector',
    'Mask',
    'Harmonica',
    'Emitter',
    'Engine',
  ],
  statRanges: { ...DEFAULT_STAT_RANGES },
  scrapValues: {},
  statKeys: ['STR', 'AGI', 'INT', 'PER', 'LCK', 'CHA'],
  calcScrap(item) {
    let total = 0;
    const stats = item.stats || {};
    for (const value of Object.values(stats)) {
      if (typeof value === 'number') total += value;
    }
    const mods = item.mods || {};
    for (const value of Object.values(mods)) {
      if (typeof value === 'number') total += Math.abs(value);
    }
    return Math.max(1, Math.round(total / 2));
  },
  pick(list, rng) {
    return list[Math.floor(rng() * list.length)];
  },
  randRange(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  },
  generate(rank = 'rusted', rng = Math.random) {
    const adjective = ItemGen.pick(ItemGen.adjectives, rng);
    const noun = ItemGen.pick(ItemGen.nouns, rng);
    const range = ItemGen.statRanges[rank] ?? ItemGen.statRanges.rusted;
    const amount = ItemGen.randRange(range.min, range.max, rng);
    const stat = ItemGen.pick(ItemGen.statKeys, rng);
    const lowerNoun = noun.toLowerCase();
    const item: GeneratedTrinket = {
      id: `gen_${nextItemId++}`,
      type: 'trinket',
      name: `${adjective} ${noun}`,
      rank,
      stats: {},
      mods: { [stat]: amount },
      scrap: 0,
      tags: [lowerNoun],
    };
    item.scrap = ItemGen.scrapValues[rank] ?? ItemGen.calcScrap(item);
    if (lowerNoun === 'mask') {
      const templates = globalThis.Dustland?.personaTemplates ?? {};
      const personaIds = Object.keys(templates);
      if (personaIds.length > 0) {
        item.persona = ItemGen.pick(personaIds, rng);
      }
    }
    return item;
  },
};

Object.assign(globalThis, { ItemGen });
