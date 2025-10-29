const { getPersonaTemplates, setItemGenerator } = DustlandGlobals;
const ADJECTIVES = Object.freeze([
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
]);
const NOUNS = Object.freeze([
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
]);
const STAT_RANGES = Object.freeze({
    rusted: { min: 1, max: 4 },
    sealed: { min: 4, max: 7 },
    armored: { min: 7, max: 10 },
    vaulted: { min: 10, max: 15 }
});
const STAT_KEYS = Object.freeze(['STR', 'AGI', 'INT', 'PER', 'LCK', 'CHA']);
const DEFAULT_RANK = 'rusted';
const DEFAULT_RNG = Math.random;
function normalizeRank(rank) {
    if (!rank)
        return DEFAULT_RANK;
    return rank in STAT_RANGES ? rank : DEFAULT_RANK;
}
function createGeneratedItem(name, noun, rank, stat, amount) {
    return {
        id: `gen_${nextItemId++}`,
        type: 'trinket',
        name,
        rank,
        stats: {},
        mods: { [stat]: amount },
        scrap: 0,
        tags: [noun.toLowerCase()]
    };
}
function assignPersona(item, noun, rng) {
    if (noun.toLowerCase() !== 'mask')
        return;
    const personaIds = Object.keys(getPersonaTemplates());
    if (!personaIds.length)
        return;
    item.persona = personaIds[Math.floor(rng() * personaIds.length)];
}
let nextItemId = 1;
const ItemGen = {
    adjectives: ADJECTIVES,
    nouns: NOUNS,
    statRanges: STAT_RANGES,
    scrapValues: {},
    statKeys: STAT_KEYS,
    calcScrap(item) {
        let total = 0;
        const stats = item.stats ?? {};
        for (const value of Object.values(stats)) {
            if (typeof value === 'number')
                total += value;
        }
        const mods = item.mods ?? {};
        for (const value of Object.values(mods)) {
            if (typeof value === 'number')
                total += Math.abs(value);
        }
        return Math.max(1, Math.round(total / 2));
    },
    pick(list, rng) {
        return list[Math.floor(rng() * list.length)];
    },
    randRange(min, max, rng) {
        return min + Math.floor(rng() * (max - min + 1));
    },
    generate(rank = DEFAULT_RANK, rng = DEFAULT_RNG) {
        const adjective = this.pick(this.adjectives, rng);
        const noun = this.pick(this.nouns, rng);
        const normalizedRank = normalizeRank(rank);
        const range = this.statRanges[normalizedRank] ?? this.statRanges[DEFAULT_RANK];
        const amount = this.randRange(range.min, range.max, rng);
        const stat = this.pick(this.statKeys, rng);
        const item = createGeneratedItem(`${adjective} ${noun}`, noun, normalizedRank, stat, amount);
        const scrapKey = typeof rank === 'string' ? rank : normalizedRank;
        const scrap = this.scrapValues[scrapKey] ?? this.scrapValues[normalizedRank];
        item.scrap = typeof scrap === 'number' ? scrap : this.calcScrap(item);
        assignPersona(item, noun, rng);
        return item;
    }
};
setItemGenerator(ItemGen);
