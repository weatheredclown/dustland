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
  affixes: [
    'of Fury',
    'of Echoes',
    'of Dread'
  ],
  miniQuestHooks: [
    'lostArchive',
    'metalPlague'
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
  scrapValues: {
    rusted: 5,
    sealed: 20,
    armored: 100,
    vaulted: 500
  },
  pick(list, rng){
    return list[Math.floor(rng() * list.length)];
  },
  randRange(min, max, rng){
    return min + Math.floor(rng() * (max - min + 1));
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
      stats: { power },
      scrap: this.scrapValues[rank] || this.scrapValues.rusted
    };
    item.tags = [noun.toLowerCase()];
    if(type === 'oddity'){
      item.lore = this.pick(this.oddityLore, rng);
    }
    if(rank === 'vaulted'){
      if(rng() < 0.5){
        item.affix = this.pick(this.affixes, rng);
        item.name += ` ${item.affix}`;
      } else {
        item.miniQuest = this.pick(this.miniQuestHooks, rng);
      }
    }
    return item;
  }
};
Object.assign(globalThis, { ItemGen });
