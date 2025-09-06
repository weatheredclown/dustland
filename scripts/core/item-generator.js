// ===== Item Generator =====
let nextItemId = 1;
const ItemGen = {
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
    'Nova-Etched'
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
    'Engine'
  ],
  statRanges: {
    rusted: { min: 1, max: 4 },
    sealed: { min: 4, max: 7 },
    armored: { min: 7, max: 10 },
    vaulted: { min: 10, max: 15 }
  },
  scrapValues: {},
  statKeys: ['STR','AGI','INT','PER','LCK','CHA'],
  calcScrap(item){
    let total = 0;
    const stats = item.stats || {};
    for (const val of Object.values(stats)) {
      if (typeof val === 'number') total += val;
    }
    const mods = item.mods || {};
    for (const val of Object.values(mods)) {
      if (typeof val === 'number') total += Math.abs(val);
    }
    return Math.max(1, Math.round(total / 2));
  },
  pick(list, rng){
    return list[Math.floor(rng() * list.length)];
  },
  randRange(min, max, rng){
    return min + Math.floor(rng() * (max - min + 1));
  },
  generate(rank='rusted', rng=Math.random){
    const adj = this.pick(this.adjectives, rng);
    const noun = this.pick(this.nouns, rng);
    const range = this.statRanges[rank] || this.statRanges.rusted;
    const amount = this.randRange(range.min, range.max, rng);
    const stat = this.pick(this.statKeys, rng);
    const item = {
      id: `gen_${nextItemId++}`,
      type: 'trinket',
      name: `${adj} ${noun}`,
      rank,
      stats: {},
      mods: { [stat]: amount },
      scrap: 0
    };
    item.scrap = this.scrapValues[rank] ?? this.calcScrap(item);
    item.tags = [noun.toLowerCase()];
    return item;
  }
};
Object.assign(globalThis, { ItemGen });
