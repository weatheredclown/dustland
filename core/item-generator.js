// ===== Item Generator =====
const ItemGen = {
  types: ['weapon','armor','gadget','oddity'],
  adjectives: ['Grit-Stitched','Rusty','Quantum','Crystal'],
  nouns: ['Repeater','Shield','Gizmo','Compass'],
  statRanges: {
    rusted: { min: 1, max: 3 },
    sealed: { min: 3, max: 5 },
    armored: { min: 5, max: 8 },
    vaulted: { min: 8, max: 12 }
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
    return {
      type,
      name: `${adj} ${noun}`,
      rank,
      stats: { power },
      scrap: Math.round(power / 2)
    };
  }
};
Object.assign(globalThis, { ItemGen });
