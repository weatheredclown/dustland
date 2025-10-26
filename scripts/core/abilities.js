// @ts-nocheck
const Abilities = {};
const Specials = {};
function defineAbility(id, data = {}) {
    const ability = {
        id,
        type: data.type ?? 'active',
        cost: data.cost ?? 0,
        prereq: {
            level: data.prereq?.level ?? 0,
            abilities: data.prereq?.abilities ?? []
        },
        effect: data.effect ?? {}
    };
    Abilities[id] = ability;
    return ability;
}
function defineSpecial(id, data = {}) {
    const special = {
        id,
        adrenaline_cost: data.adrenaline_cost ?? 0,
        target_type: data.target_type ?? 'single',
        effect: data.effect ?? {},
        wind_up_time: data.wind_up_time ?? 0
    };
    Specials[id] = special;
    return special;
}
Object.assign(globalThis, { Abilities, defineAbility, Specials, defineSpecial });
const STARTER_SPECIALS = [
    { id: 'POWER_STRIKE', label: 'Power Strike', dmg: 3, adrCost: 30, cooldown: 1 },
    { id: 'STUN_GRENADE', label: 'Stun Grenade', dmg: 1, stun: 1, adrCost: 40, cooldown: 3 },
    { id: 'FIRST_AID', label: 'First Aid', heal: 4, adrCost: 35, cooldown: 2 },
    { id: 'ADRENAL_SURGE', label: 'Adrenal Surge', adrGain: 50, adrCost: 0, cooldown: 4 },
    { id: 'GUARD_UP', label: 'Guard', guard: true, adrCost: 20, cooldown: 2 }
];
for (const special of STARTER_SPECIALS) {
    Specials[special.id] = special;
}
