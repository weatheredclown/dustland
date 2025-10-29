// Import helpers from the global namespace
const { getPersonaTemplates, setItemGenerator } = DustlandGlobals;
// --- Constants ---
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
    'Nova-Etched',
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
    'Engine',
]);
const STAT_RANGES = Object.freeze({
    rusted: { min: 1, max: 4 },
    sealed: { min: 4, max: 7 },
    armored: { min: 7, max: 10 },
    vaulted: { min: 10, max: 15 },
});
const STAT_KEYS = Object.freeze(['STR', 'AGI', 'INT', 'PER', 'LCK', 'CHA']);
const DEFAULT_RANK = 'rusted';
const DEFAULT_RNG = Math.random;
let nextItemId = 1;
// --- Helper Functions ---
/**
 * Safely normalizes a rank string to a valid ItemGeneratorRank.
 */
function normalizeRank(rank) {
    if (!rank)
        return DEFAULT_RANK;
    return rank in STAT_RANGES ? rank : DEFAULT_RANK;
}
/**
 * Creates the base item object.
 * Note: The return type 'GeneratedTrinketItem' comes from the global .d.ts file.
 */
function createGeneratedItem(name, noun, rank, stat, amount) {
    return {
        id: `gen_${nextItemId++}`,
        type: 'trinket',
        name,
        rank,
        stats: {}, // Generated items use mods, not base stats
        mods: { [stat]: amount },
        scrap: 0, // Will be calculated next
        tags: [noun.toLowerCase()],
        // PartyItem properties (from GeneratedTrinketItem -> PartyItem -> GameItem)
        slot: 'trinket',
        equip: null,
        unequip: null,
        narrative: null,
        use: undefined,
        desc: undefined,
        rarity: 0,
        value: 0,
        count: 1,
        maxStack: 1,
        cursed: false,
        cursedKnown: false,
    };
}
/**
 * Assigns a persona to the item if it's a 'Mask'.
 */
function assignPersona(item, noun, rng) {
    if (noun.toLowerCase() !== 'mask')
        return;
    const templates = getPersonaTemplates();
    const personaIds = Object.keys(templates);
    if (!personaIds.length)
        return;
    item.persona = personaIds[Math.floor(rng() * personaIds.length)];
}
// --- Item Generator ---
const ItemGen = {
    adjectives: ADJECTIVES,
    nouns: NOUNS,
    statRanges: STAT_RANGES,
    scrapValues: {}, // Can be populated later
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
    generate(rank, rng = DEFAULT_RNG) {
        const adjective = this.pick(this.adjectives, rng);
        const noun = this.pick(this.nouns, rng);
        const normalizedRank = normalizeRank(rank);
        const range = this.statRanges[normalizedRank] ?? this.statRanges[DEFAULT_RANK];
        const amount = this.randRange(range.min, range.max, rng);
        const stat = this.pick(this.statKeys, rng);
        const item = createGeneratedItem(`${adjective} ${noun}`, noun, normalizedRank, stat, amount);
        // Calculate scrap value
        const scrapKey = typeof rank === 'string' ? rank : normalizedRank;
        const scrap = this.scrapValues[scrapKey] ?? this.scrapValues[normalizedRank];
        item.scrap = typeof scrap === 'number' ? scrap : this.calcScrap(item);
        // Assign persona if applicable
        assignPersona(item, noun, rng);
        return item;
    },
};
// Register the generator with the game engine
setItemGenerator(ItemGen);
