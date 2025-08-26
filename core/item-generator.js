// ===== Item Generator =====
let nextItemId = 1;
const ItemGen = {
  types: ['weapon','armor','gadget','oddity'],
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
  oddityLore: [
    'Whispers of a lost caravan.',
    'Hums a tune no one remembers.',
    'Its needle spins toward a buried vault.',
    'Smells faintly of ozone after a storm.',
    'Vibrates near old world tech.'
  ],
  statRanges: {
    rusted: { min: 1, max: 4 },
    sealed: { min: 4, max: 7 },
    armored: { min: 7, max: 10 },
    vaulted: { min: 10, max: 15 }
  },
  pick(list, rng){
    return list[Math.floor(rng() * list.length)];
  },
  randRange(min, max, rng){
    return min + Math.floor(rng() * (max - min + 1));
  },
  calcScrap(item){
    let total = 0;
    const stats = item.stats || {};
    for(const val of Object.values(stats))
      if(typeof val === 'number') total += val;
    const mods = item.mods || {};
    for(const val of Object.values(mods))
      if(typeof val === 'number') total += Math.abs(val);
    return Math.max(1, Math.round(total / 2));
  },
  generate(rank='rusted', rng=Math.random){
    const type = this.pick(this.types, rng);
    const adj = this.pick(this.adjectives, rng);
    const noun = this.pick(this.nouns, rng);
    const range = this.statRanges[rank] || this.statRanges.rusted;
    const power = this.randRange(range.min, range.max, rng);
    const item = {
      id: `gen_${nextItemId++}`,
      type,
      name: `${adj} ${noun}`,
      rank,
      stats: { power }
    };
    item.scrap = this.calcScrap(item);
    if(type === 'oddity'){
      item.lore = this.pick(this.oddityLore, rng);
    }
    return item;
  }
};
Object.assign(globalThis, { ItemGen });
