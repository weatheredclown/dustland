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
(async () => {
    try {
        if (typeof process !== 'undefined' && process.cwd) {
            const fs = await import('node:fs/promises');
            const txt = await fs.readFile(process.cwd() + '/data/moves/starter.json', 'utf8');
            const moves = JSON.parse(txt);
            moves.forEach((m) => { Specials[m.id] = m; });
        }
        else if (typeof fetch === 'function') {
            const res = await fetch('data/moves/starter.json');
            if (res.ok) {
                const moves = await res.json();
                moves.forEach((m) => { Specials[m.id] = m; });
            }
        }
    }
    catch (e) {
        // ignore load errors
    }
})();
